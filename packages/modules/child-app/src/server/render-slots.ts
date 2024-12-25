import { extname } from 'path';
import { gt, eq } from 'semver';
import flatten from '@tinkoff/utils/array/flatten';
import type { ExtractTokenType, ExtractDependencyType } from '@tinkoff/dippy';
import { resolve } from '@tinkoff/url';
import {
  type ChildAppDiManager,
  type ChildAppLoader,
  type ChildAppPreloadManager,
  type CHILD_APP_RESOLVE_CONFIG_TOKEN,
  CHILD_APP_INTERNAL_CHUNK_EXTRACTOR,
} from '@tramvai/tokens-child-app';
import type { LOGGER_TOKEN } from '@tramvai/tokens-common';
import type {
  PageResource,
  REACT_SERVER_RENDER_MODE,
  RESOURCES_REGISTRY,
} from '@tramvai/tokens-render';
import { RENDER_SLOTS, ResourceSlot, ResourceType } from '@tramvai/tokens-render';
import type { ServerLoader } from './loader';
import { getSharedScope } from '../shared/webpack/moduleFederation';

const asyncScriptAttrs = {
  defer: null,
  async: 'async',
};
const deferScriptAttrs = {
  defer: 'defer',
  async: null,
};
// for cases when Child App script was loaded or failed when script was added at server-side,
// and Child App initialization logic executed after that, we need to get script loading status
const entryAttrs = {
  onload: `this.setAttribute('loaded', 'true')`,
  onerror: `this.setAttribute('loaded', 'false')`,
};
// for cases when preloaded chunk loading is failed before webpack add this script loading handlers,
// we need to remove script and webpack will try to load it itself https://github.com/webpack/webpack/issues/14874
const chunkAttrs = {
  onerror: `this.remove()`,
};

export const registerChildAppRenderSlots =
  ({
    logger,
    diManager,
    resolveFullConfig,
    preloadManager,
    loader,
    renderMode,
    resourcesRegistry,
  }: {
    logger: ExtractDependencyType<typeof LOGGER_TOKEN>;
    diManager: ChildAppDiManager;
    resolveFullConfig: ExtractDependencyType<typeof CHILD_APP_RESOLVE_CONFIG_TOKEN>;
    preloadManager: ChildAppPreloadManager;
    loader: ChildAppLoader | ServerLoader;
    renderMode: typeof REACT_SERVER_RENDER_MODE | null;
    resourcesRegistry: ExtractDependencyType<typeof RESOURCES_REGISTRY>;
  }) =>
  async () => {
    const log = logger('child-app:render:slots');
    const result: ExtractTokenType<typeof RENDER_SLOTS> = [];
    // defer scripts is not suitable for React streaming, we need to ability to run them as early as possible
    // https://github.com/reactwg/react-18/discussions/114
    const scriptTypeAttr = renderMode === 'streaming' ? asyncScriptAttrs : deferScriptAttrs;

    const addChunk = (chunk?: string, isEntry = false) => {
      if (!chunk) {
        return;
      }

      const extension = extname(chunk);

      switch (extension) {
        case '.js':
          result.push({
            type: ResourceType.script,
            // we need to load Child Apps scripts before main application scripts
            slot: ResourceSlot.HEAD_DYNAMIC_SCRIPTS,
            payload: chunk,
            attrs: {
              'data-critical': 'true',
              ...scriptTypeAttr,
              ...(isEntry ? entryAttrs : chunkAttrs),
            },
          });
          break;
        case '.css':
          result.push({
            type: ResourceType.style,
            slot: ResourceSlot.HEAD_CORE_STYLES,
            payload: chunk,
            attrs: {
              'data-critical': 'true',
            },
          });
          break;
      }
    };

    const preloadedList = new Set(preloadManager.getPreloadedList());
    const sharedScope = getSharedScope();

    const mapSharedToChildApp = new Map<
      string,
      { version: string; type: string; name: string; eager: boolean }
    >();

    // sharedScope will contain all of the shared chunks that were added
    // while server is running
    // but on the page we can use only shared chunks that either provided by the root-app
    // or one of loaded child-app
    // so gather all of the available shared modules, check the ones that are available in the currently
    // preloaded child-apps and figure out the best single version of the dep
    for (const shareKey in sharedScope) {
      for (const version in sharedScope[shareKey]) {
        const dep = sharedScope[shareKey][version];
        const last = mapSharedToChildApp.get(shareKey);
        const { eager, from } = dep;
        const [type, name] = from.split(':');

        if (
          !last ||
          // module federation will pick the highest available version
          // https://github.com/webpack/webpack/blob/b67626c7b4ffed8737d195b27c8cea1e68d58134/lib/sharing/ConsumeSharedRuntimeModule.js#L144
          gt(version, last.version) ||
          // if versions are equal then module federation will pick
          // the dep with eager prop (it's set in root-app) of with the child-app with highest name in alphabetical order
          (eq(version, last.version) && (eager !== last.eager ? eager : name > last.name))
        ) {
          mapSharedToChildApp.set(shareKey, { version, type, name, eager });
        }
      }
    }

    // eslint-disable-next-line max-statements
    preloadedList.forEach((requestConfig) => {
      const config = resolveFullConfig(requestConfig);

      if (!config) {
        return;
      }

      const stats = 'getStats' in loader ? loader.getStats(config) : undefined;
      const di = diManager.getChildDi(config);
      const loadableAssets = di?.get(CHILD_APP_INTERNAL_CHUNK_EXTRACTOR)?.getMainAssets();

      addChunk(config.client.entry, true);

      if (config.css) {
        addChunk(config.css.entry);
      }

      loadableAssets
        ?.map((asset: any) => resolve(config.client.baseUrl, asset.filename))
        .filter((file: string) => {
          // filter entry js and css chunks
          return config.client.entry !== file && config.css?.entry !== file;
        })
        .forEach((file: string) => {
          addChunk(file);
        });

      if (stats && stats.federatedModules) {
        for (const federatedModule of stats.federatedModules) {
          // entries are duplicated in the `exposes` field of federated stats for some reason
          // for now there anyway should be only one exposed entry so took the first available
          const files = new Set<string>();
          federatedModule?.exposes?.entry?.forEach((entry) => {
            for (const key in entry) {
              entry[key].forEach((file) => files.add(file));
            }
          });

          for (const file of files) {
            addChunk(resolve(config.client.baseUrl, file));
          }

          for (const sharedModule of federatedModule.sharedModules) {
            const { shareKey } = sharedModule.provides?.[0];
            const { chunks } = sharedModule;

            const bestShared = mapSharedToChildApp.get(shareKey);

            if (!bestShared?.eager && bestShared?.name === config.name) {
              for (const chunk of chunks) {
                addChunk(resolve(config.client.baseUrl, chunk));
              }

              // in stats.json federated stats could contain 2 sets of chunks for shared modules
              // there usual one and fallback. For shared module there could be used any of this
              // and the other one will be useless. So delete entry from map after its usage in order
              // to add only single set of chunks for the same shared dep
              mapSharedToChildApp.delete(shareKey);
            }
          }
        }
      }

      if (!di) {
        return;
      }

      try {
        const renderSlots = di.get({ token: RENDER_SLOTS, optional: true }) as any[];

        if (renderSlots) {
          result.push(...flatten<PageResource>(renderSlots));
        }
      } catch (error) {
        log.error({
          event: 'get-slots-failed',
          childApp: {
            name: requestConfig.name,
            version: requestConfig.version,
            tag: requestConfig.tag,
          },
        });
      }
    });

    result.map((item) => resourcesRegistry.register(item));
  };
