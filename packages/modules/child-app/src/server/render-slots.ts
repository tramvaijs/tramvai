import { extname } from 'path';
import flatten from '@tinkoff/utils/array/flatten';
import type { ExtractTokenType, ExtractDependencyType } from '@tinkoff/dippy';
import { resolve } from '@tinkoff/url';
import {
  type ChildAppDiManager,
  type ChildAppLoader,
  type ChildAppPreloadManager,
  type CHILD_APP_RESOLVE_CONFIG_TOKEN,
  CHILD_APP_INTERNAL_CHUNK_EXTRACTOR,
  ChildAppFinalConfig,
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
import { getFlatSharedModulesList, getFlatSharedScopeItemsList } from './module-federation/utils';
import { resolveBestLoadedSharedModules } from './module-federation/best-loaded-shared-modules';

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
  // eslint-disable-next-line max-statements
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

    const preloadedConfigs = Array.from(preloadedList)
      .map((requestConfig) => {
        return resolveFullConfig(requestConfig);
      })
      .filter(Boolean) as ChildAppFinalConfig[];

    // flat list of all shared items initialized in shared scope
    const sharedScopeItems = getFlatSharedScopeItemsList(sharedScope);

    // flat list of all preloaded Child Apps shared modules
    const sharedModules = getFlatSharedModulesList({
      preloadedConfigs,
      loader: loader as ServerLoader,
    });

    // optimal shared dependencies for preloaded Child Apps
    const bestSharedModules = resolveBestLoadedSharedModules({
      sharedModules,
      sharedScopeItems,
    });

    // eslint-disable-next-line max-statements
    preloadedConfigs.forEach((config) => {
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
            name: config.name,
            version: config.version,
            tag: config.tag,
          },
        });
      }
    });

    // shared chunks deduplication
    const addedSharedChunks = new Set<string>();
    // preloaded chunks we need to pass to client
    const serializableSharedModules: {
      containerName: string;
      shareKey: string;
      version: string;
      childAppName: string;
      childAppVersion: string;
    }[] = [];

    bestSharedModules.forEach(({ shareKey, version, chunks, childAppName, childAppVersion }) => {
      const childAppConfig = preloadedConfigs.find((config) => {
        return config.name === childAppName && config.version === childAppVersion;
      });

      // if it is application shared dependency, we don't have any extra chunks
      if (childAppConfig && chunks) {
        for (const chunk of chunks) {
          if (!addedSharedChunks.has(chunk)) {
            addedSharedChunks.add(chunk);

            addChunk(resolve(childAppConfig.client.baseUrl, chunk));

            const containerName = `child-app__${childAppConfig.client.entry}`;

            serializableSharedModules.push({
              containerName,
              shareKey,
              version,
              childAppName: childAppName!,
              childAppVersion: childAppVersion!,
            });
          }
        }
      }
    });

    result.push({
      type: ResourceType.inlineScript,
      slot: ResourceSlot.HEAD_POLYFILLS,
      payload: `window.__webpack_share_preloaded__ = [
${serializableSharedModules.map((m) => {
  return `${JSON.stringify(m)}`;
})}
];`,
    });

    result.map((item) => resourcesRegistry.register(item));
  };
