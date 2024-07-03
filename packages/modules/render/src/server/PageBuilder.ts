/* eslint-disable sort-class-members/sort-class-members */
import flatten from '@tinkoff/utils/array/flatten';
import type { CONTEXT_TOKEN, LOGGER_TOKEN } from '@tramvai/module-common';
import type { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';
import { buildPage } from '@tinkoff/htmlpagebuilder';
import type {
  HTML_ATTRS,
  POLYFILL_CONDITION,
  RENDER_SLOTS,
  RESOURCES_REGISTRY,
  RENDER_FLOW_AFTER_TOKEN,
  FETCH_WEBPACK_STATS_TOKEN,
  REACT_SERVER_RENDER_MODE,
  WebpackStats,
} from '@tramvai/tokens-render';
import { ResourceSlot, ResourceType } from '@tramvai/tokens-render';
import { safeStringify } from '@tramvai/safe-strings';
import { ChunkExtractor } from '@loadable/server';
import type { DI_TOKEN, ExtractDependencyType } from '@tinkoff/dippy';
import { bundleResource } from './blocks/bundleResource/bundleResource';
import { polyfillResources } from './blocks/polyfill';
import { addPreloadForCriticalJS } from './blocks/preload/preloadBlock';
import type { ReactRenderServer } from './ReactRenderServer';
import { formatAttributes } from './utils';

type NarrowToArray<T> = T extends any[] ? T : T[];

export const mapResourcesToSlots = (resources) =>
  resources.reduce((acc, resource) => {
    const { slot } = resource;

    if (Array.isArray(acc[slot])) {
      acc[slot].push(resource);
    } else {
      acc[slot] = [resource];
    }
    return acc;
  }, {});

export class PageBuilder {
  private resourcesRegistry: typeof RESOURCES_REGISTRY;

  private pageService: typeof PAGE_SERVICE_TOKEN;

  // eslint-disable-next-line react/static-property-placement
  private context: typeof CONTEXT_TOKEN;

  private htmlPageSchema: any;

  private reactRender: ReactRenderServer;

  private htmlAttrs: Array<typeof HTML_ATTRS>;

  private polyfillCondition: typeof POLYFILL_CONDITION;

  private modern: boolean;

  private renderFlowAfter: ExtractDependencyType<typeof RENDER_FLOW_AFTER_TOKEN>;

  private log: ReturnType<ExtractDependencyType<typeof LOGGER_TOKEN>>;

  private fetchWebpackStats: typeof FETCH_WEBPACK_STATS_TOKEN;

  private di: typeof DI_TOKEN;

  private renderMode: typeof REACT_SERVER_RENDER_MODE | null;

  constructor({
    renderSlots,
    pageService,
    resourcesRegistry,
    context,
    reactRender,
    htmlPageSchema,
    polyfillCondition,
    htmlAttrs,
    modern,
    renderFlowAfter,
    logger,
    fetchWebpackStats,
    di,
    renderMode,
  }) {
    this.htmlAttrs = htmlAttrs;
    this.renderSlots = flatten(renderSlots || []);
    this.pageService = pageService;
    this.context = context;
    this.resourcesRegistry = resourcesRegistry;
    this.reactRender = reactRender;
    this.htmlPageSchema = htmlPageSchema;
    this.polyfillCondition = polyfillCondition;
    this.modern = modern;
    this.renderFlowAfter = renderFlowAfter || [];
    this.log = logger('page-builder');
    this.fetchWebpackStats = fetchWebpackStats;
    this.di = di;
    this.renderMode = renderMode;
  }

  async flow(): Promise<string> {
    const stats = await this.fetchWebpackStats({ modern: this.modern });
    const extractor = new ChunkExtractor({ stats, entrypoints: [] });

    // first we render the application, because we need to extract information about the data used by the components
    await this.renderApp({ extractor, stats });

    // load information and dependency for the current bundle and page
    await this.fetchChunksInfo(extractor);

    await Promise.all(
      this.renderFlowAfter.map((callback) =>
        callback().catch((error) => {
          this.log.warn({ event: 'render-flow-after-error', callback, error });
        })
      )
    );

    this.dehydrateState();

    if (process.env.TRAMVAI_CLI_COMMAND === 'static') {
      await this.resourcesRegistry.prefetchInlinePageResources();
    }

    this.preloadBlock();

    return this.generateHtml();
  }

  dehydrateState() {
    // for streaming we need to have initial state before application scripts,
    // body end will be sent after suspended components will be resolved, but hydration will starl earlier
    const slot =
      this.renderMode === 'streaming' ? ResourceSlot.HEAD_DYNAMIC_SCRIPTS : ResourceSlot.BODY_END;

    this.resourcesRegistry.register({
      type: ResourceType.asIs,
      slot: ResourceSlot.HEAD_PERFORMANCE,
      payload: `<script>window.__TRAMVAI_HTML_READY_PROMISE__ = new Promise((resolve) => { window.__TRAMVAI_HTML_READY_RESOLVE__ = resolve; });</script>`,
    });

    this.resourcesRegistry.register({
      type: ResourceType.asIs,
      slot,
      // String much better than big object, source https://v8.dev/blog/cost-of-javascript-2019#json
      payload: `<script id="__TRAMVAI_STATE__" type="application/json">${safeStringify(
        this.context.dehydrate().dispatcher
      )}</script>`,
    });

    this.resourcesRegistry.register({
      type: ResourceType.asIs,
      slot,
      payload: `<script>window.__TRAMVAI_HTML_READY__ = true; window.__TRAMVAI_HTML_READY_RESOLVE__();</script>`,
    });
  }

  async fetchChunksInfo(extractor: ChunkExtractor) {
    const { modern, renderMode } = this;
    const { bundle, pageComponent } = this.pageService.getConfig();

    this.resourcesRegistry.register(
      await bundleResource({
        bundle,
        modern,
        extractor,
        pageComponent,
        fetchWebpackStats: this.fetchWebpackStats,
        renderMode: this.renderMode,
      })
    );
    this.resourcesRegistry.register(
      await polyfillResources({
        condition: this.polyfillCondition,
        modern,
        fetchWebpackStats: this.fetchWebpackStats,
        renderMode,
      })
    );
  }

  preloadBlock() {
    // looks like we don't need this scripts preload at all, but also it is official recommendation for streaming
    // https://github.com/reactwg/react-18/discussions/114
    if (this.renderMode === 'streaming') {
      return;
    }

    const preloadResources = addPreloadForCriticalJS(this.resourcesRegistry.getPageResources());

    this.resourcesRegistry.register(preloadResources);
  }

  generateHtml() {
    const resultSlotHandlers = mapResourcesToSlots([
      ...this.renderSlots,
      ...this.resourcesRegistry.getPageResources(),
    ]);

    return buildPage({
      slotHandlers: resultSlotHandlers,
      description: this.htmlPageSchema,
    });
  }

  private renderSlots: NarrowToArray<typeof RENDER_SLOTS>;

  async renderApp({ extractor, stats }: { extractor: ChunkExtractor; stats: WebpackStats }) {
    const html = await this.reactRender.render({ extractor, stats });
    const appHtmlAttrs = formatAttributes(this.htmlAttrs, 'app');

    this.di.register({ provide: 'tramvai app html attributes', useValue: appHtmlAttrs });

    this.renderSlots = this.renderSlots.concat({
      type: ResourceType.asIs,
      slot: ResourceSlot.REACT_RENDER,
      payload: `<div ${appHtmlAttrs}>${html}</div>`,
    });
  }
}
/* eslint-enable sort-class-members/sort-class-members */
