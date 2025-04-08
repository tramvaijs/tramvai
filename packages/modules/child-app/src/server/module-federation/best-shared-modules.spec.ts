import { ChildAppFinalConfig } from '@tramvai/tokens-child-app';
import {
  ModuleFederationSharedModule,
  ModuleFederationSharedScope,
  ModuleFederationStats,
} from '../../shared/webpack/moduleFederation';
import { resolveBestSharedModules } from './best-shared-modules';
import { getFlatSharedModulesList, getFlatSharedScopeItemsList } from './utils';
import { ServerLoader } from '../loader';

const mocks = {
  sharedScope: {
    tramvaiCoreFromHostLatest: {
      get: () => {},
      from: 'application:root-app:0.0.0-stub',
      eager: true,
      loaded: 1 as const,
      name: '@tramvai/core',
      version: '5.0.5',
    },
    tramvaiCoreFromHostOld: {
      get: () => {},
      from: 'application:root-app:0.0.0-stub',
      eager: true,
      loaded: 1 as const,
      name: '@tramvai/core',
      version: '3.0.5',
    },
    tramvaiCoreFromChildLatest: {
      get: () => {},
      from: 'child-app:header:0.0.0-stub',
      eager: false,
      loaded: 1 as const,
      name: '@tramvai/core',
      version: '5.0.1',
    },
    tramvaiCoreFromChildOld: {
      get: () => {},
      from: 'child-app:header:0.0.0-stub',
      eager: false,
      loaded: 1 as const,
      name: '@tramvai/core',
      version: '3.0.1',
    },
    dippyFromHostLatest: {
      get: () => {},
      from: 'application:root-app:0.0.0-stub',
      eager: true,
      loaded: 1 as const,
      name: '@tinkoff/dippy',
      version: '0.10.0',
    },
    dippyFromHostLatestHigh: {
      get: () => {},
      from: 'application:root-app:0.0.0-stub',
      eager: true,
      loaded: 1 as const,
      name: '@tinkoff/dippy',
      version: '0.10.5',
    },
    dippyFromHostLatestLow: {
      get: () => {},
      from: 'application:root-app:0.0.0-stub',
      eager: true,
      loaded: 1 as const,
      name: '@tinkoff/dippy',
      version: '0.10.1',
    },
    dippyFromHostOld: {
      get: () => {},
      from: 'application:root-app:0.0.0-stub',
      eager: true,
      loaded: 1 as const,
      name: '@tinkoff/dippy',
      version: '0.9.0',
    },
    dippyFromChildLatest: {
      get: () => {},
      from: 'child-app:header:0.0.0-stub',
      eager: false,
      loaded: 1 as const,
      name: '@tinkoff/dippy',
      version: '0.10.0',
    },
    dippyFromChildLatestHigh: {
      get: () => {},
      from: 'child-app:header:0.0.0-stub',
      eager: false,
      loaded: 1 as const,
      name: '@tinkoff/dippy',
      version: '0.10.4',
    },
    dippyFromChildLatestLow: {
      get: () => {},
      from: 'child-app:header:0.0.0-stub',
      eager: false,
      loaded: 1 as const,
      name: '@tinkoff/dippy',
      version: '0.10.2',
    },
    dippyFromChildOld: {
      get: () => {},
      from: 'child-app:header:0.0.0-stub',
      eager: false,
      loaded: 1 as const,
      name: '@tinkoff/dippy',
      version: '0.9.0',
    },
  },
  sharedModules: {
    headerTramvaiCoreLatest: {
      chunks: ['core_lib_index_es_js-_08520_client.chunk.xxxxx.js'],
      provides: [
        {
          shareScope: 'default',
          shareKey: '@tramvai/core',
          requiredVersion: '^5.0.0',
          strictVersion: true,
          singleton: false,
          eager: false,
        },
      ],
    },
    headerTramvaiCoreOld: {
      chunks: ['core_lib_index_es_js-_08520_client.chunk.xxxxx.js'],
      provides: [
        {
          shareScope: 'default',
          shareKey: '@tramvai/core',
          requiredVersion: '^3.0.0',
          strictVersion: true,
          singleton: false,
          eager: false,
        },
      ],
    },
    headerDippyLatest: {
      chunks: ['_tinkoff_dippy_lib_di_es_js_client.chunk.xxxxx.js'],
      provides: [
        {
          shareScope: 'default',
          shareKey: '@tinkoff/dippy',
          requiredVersion: '^0.10.0',
          strictVersion: true,
          singleton: false,
          eager: false,
        },
      ],
    },
    headerDippyOld: {
      chunks: ['_tinkoff_dippy_lib_di_es_js_client.chunk.xxxxx.js'],
      provides: [
        {
          shareScope: 'default',
          shareKey: '@tinkoff/dippy',
          requiredVersion: '^0.9.0',
          strictVersion: true,
          singleton: false,
          eager: false,
        },
      ],
    },
  },
  preloadedConfigs: {
    header: {
      name: 'header',
      tag: 'latest',
      version: '0.0.0-stub',
      key: 'header@0.0.0-stub',
      server: {
        entry: 'http://localhost:4040/header/header_server@0.0.0-stub.js',
      },
      client: {
        baseUrl: 'http://localhost:4040/header/',
        entry: 'http://localhost:4040/header/header_client@0.0.0-stub.js',
        stats: 'http://localhost:4040/header/header_stats@0.0.0-stub.json',
        statsLoadable: 'http://localhost:4040/header/header_stats_header@0.0.0-stub.json',
      },
      css: {
        entry: 'http://localhost:4040/header/header@0.0.0-stub.css',
      },
    },
    footer: {
      name: 'footer',
      tag: 'latest',
      version: '0.0.0-stub',
      key: 'footer@0.0.0-stub',
      server: {
        entry: 'http://localhost:4040/footer/footer_server@0.0.0-stub.js',
      },
      client: {
        baseUrl: 'http://localhost:4040/footer/',
        entry: 'http://localhost:4040/footer/footer_client@0.0.0-stub.js',
        stats: 'http://localhost:4040/footer/footer_stats@0.0.0-stub.json',
        statsLoadable: 'http://localhost:4040/footer/footer_stats_footer@0.0.0-stub.json',
      },
      css: {
        entry: 'http://localhost:4040/footer/footer@0.0.0-stub.css',
      },
    },
  },
};

const createStats = (sharedModules: ModuleFederationSharedModule[]): ModuleFederationStats => {
  return {
    federatedModules: [
      {
        remote:
          'window["child-app__" + (document.currentScript.src || document.currentScript.dataset.src)]',
        entry: 'undefined',
        sharedModules,
        exposes: {
          entry: [],
        },
      },
    ],
    sharedModules: [],
  };
};

describe('[@tramvai/module-child-app][server][module-federation]', () => {
  it('no Child Apps, empty shared modules', () => {
    // mock
    const sharedScope = {
      [mocks.sharedScope.tramvaiCoreFromHostLatest.name]: {
        [mocks.sharedScope.tramvaiCoreFromHostLatest.version]: {
          ...mocks.sharedScope.tramvaiCoreFromHostLatest,
        },
      },
    } satisfies ModuleFederationSharedScope;
    const preloadedConfigs: ChildAppFinalConfig[] = [];
    const loader = {
      getStats() {
        return createStats([]);
      },
    } as any as ServerLoader;

    // prepare
    const sharedScopeItems = getFlatSharedScopeItemsList(sharedScope);
    const sharedModules = getFlatSharedModulesList({
      preloadedConfigs,
      loader,
    });

    // run
    const result = resolveBestSharedModules({
      sharedModules,
      sharedScopeItems,
    });

    // assert
    expect(result).toStrictEqual([]);
  });

  it('Child Apps without shared deps, empty shared modules', () => {
    // mock
    const sharedScope = {
      [mocks.sharedScope.tramvaiCoreFromHostLatest.name]: {
        [mocks.sharedScope.tramvaiCoreFromHostLatest.version]: {
          ...mocks.sharedScope.tramvaiCoreFromHostLatest,
        },
      },
    } satisfies ModuleFederationSharedScope;
    const preloadedConfigs: ChildAppFinalConfig[] = [mocks.preloadedConfigs.header];
    const loader = {
      getStats() {
        return createStats([]);
      },
    } as any as ServerLoader;

    // prepare
    const sharedScopeItems = getFlatSharedScopeItemsList(sharedScope);
    const sharedModules = getFlatSharedModulesList({
      preloadedConfigs,
      loader,
    });

    // run
    const result = resolveBestSharedModules({
      sharedModules,
      sharedScopeItems,
    });

    // assert
    expect(result).toStrictEqual([]);
  });

  it('both latest dependency, priority from host', () => {
    // mock
    const sharedScope = {
      [mocks.sharedScope.tramvaiCoreFromHostLatest.name]: {
        [mocks.sharedScope.tramvaiCoreFromHostLatest.version]: {
          ...mocks.sharedScope.tramvaiCoreFromHostLatest,
        },
        [mocks.sharedScope.tramvaiCoreFromChildLatest.version]: {
          ...mocks.sharedScope.tramvaiCoreFromChildLatest,
        },
      },
    } satisfies ModuleFederationSharedScope;
    const preloadedConfigs: ChildAppFinalConfig[] = [mocks.preloadedConfigs.header];
    const loader = {
      getStats() {
        return createStats([mocks.sharedModules.headerTramvaiCoreLatest]);
      },
    } as any as ServerLoader;

    // prepare
    const sharedScopeItems = getFlatSharedScopeItemsList(sharedScope);
    const sharedModules = getFlatSharedModulesList({
      preloadedConfigs,
      loader,
    });

    // run
    const result = resolveBestSharedModules({
      sharedModules,
      sharedScopeItems,
    });

    // assert
    expect(result).toStrictEqual([
      {
        eager: true,
        from: 'application:root-app:0.0.0-stub',
        shareKey: '@tramvai/core',
        version: '5.0.5',
        childAppName: undefined,
        childAppVersion: undefined,
        chunks: undefined,
      },
    ]);
  });

  it('Child App require previous major version, use shared module', () => {
    // mock
    const sharedScope = {
      [mocks.sharedScope.tramvaiCoreFromHostLatest.name]: {
        [mocks.sharedScope.tramvaiCoreFromHostLatest.version]: {
          ...mocks.sharedScope.tramvaiCoreFromHostLatest,
        },
        [mocks.sharedScope.tramvaiCoreFromChildOld.version]: {
          ...mocks.sharedScope.tramvaiCoreFromChildOld,
        },
      },
    } satisfies ModuleFederationSharedScope;
    const preloadedConfigs: ChildAppFinalConfig[] = [mocks.preloadedConfigs.header];
    const loader = {
      getStats() {
        return createStats([mocks.sharedModules.headerTramvaiCoreOld]);
      },
    } as any as ServerLoader;

    // prepare
    const sharedScopeItems = getFlatSharedScopeItemsList(sharedScope);
    const sharedModules = getFlatSharedModulesList({
      preloadedConfigs,
      loader,
    });

    // run
    const result = resolveBestSharedModules({
      sharedModules,
      sharedScopeItems,
    });

    // assert
    expect(result).toStrictEqual([
      {
        eager: false,
        from: 'child-app:header:0.0.0-stub',
        shareKey: '@tramvai/core',
        version: '3.0.1',
        childAppName: 'header',
        childAppVersion: '0.0.0-stub',
        chunks: ['core_lib_index_es_js-_08520_client.chunk.xxxxx.js'],
      },
    ]);
  });

  it('Child App require lower patch version, priority from host', () => {
    // mock
    const sharedScope = {
      [mocks.sharedScope.dippyFromHostLatestHigh.name]: {
        [mocks.sharedScope.dippyFromHostLatestHigh.version]: {
          ...mocks.sharedScope.dippyFromHostLatestHigh,
        },
        [mocks.sharedScope.dippyFromChildLatestLow.version]: {
          ...mocks.sharedScope.dippyFromChildLatestLow,
        },
      },
    } satisfies ModuleFederationSharedScope;
    const preloadedConfigs: ChildAppFinalConfig[] = [mocks.preloadedConfigs.header];
    const loader = {
      getStats() {
        return createStats([mocks.sharedModules.headerDippyLatest]);
      },
    } as any as ServerLoader;

    // prepare
    const sharedScopeItems = getFlatSharedScopeItemsList(sharedScope);
    const sharedModules = getFlatSharedModulesList({
      preloadedConfigs,
      loader,
    });

    // run
    const result = resolveBestSharedModules({
      sharedModules,
      sharedScopeItems,
    });

    // assert
    expect(result).toStrictEqual([
      {
        eager: true,
        from: 'application:root-app:0.0.0-stub',
        shareKey: '@tinkoff/dippy',
        version: '0.10.5',
        childAppName: undefined,
        childAppVersion: undefined,
        chunks: undefined,
      },
    ]);
  });

  it('Child App require higher patch version, use shared module', () => {
    // mock
    const sharedScope = {
      [mocks.sharedScope.dippyFromHostLatestLow.name]: {
        [mocks.sharedScope.dippyFromHostLatestLow.version]: {
          ...mocks.sharedScope.dippyFromHostLatestLow,
        },
        [mocks.sharedScope.dippyFromChildLatestHigh.version]: {
          ...mocks.sharedScope.dippyFromChildLatestHigh,
        },
      },
    } satisfies ModuleFederationSharedScope;
    const preloadedConfigs: ChildAppFinalConfig[] = [mocks.preloadedConfigs.header];
    const loader = {
      getStats() {
        return createStats([mocks.sharedModules.headerDippyLatest]);
      },
    } as any as ServerLoader;

    // prepare
    const sharedScopeItems = getFlatSharedScopeItemsList(sharedScope);
    const sharedModules = getFlatSharedModulesList({
      preloadedConfigs,
      loader,
    });

    // run
    const result = resolveBestSharedModules({
      sharedModules,
      sharedScopeItems,
    });

    // assert
    expect(result).toStrictEqual([
      {
        eager: false,
        from: 'child-app:header:0.0.0-stub',
        shareKey: '@tinkoff/dippy',
        version: '0.10.4',
        childAppName: 'header',
        childAppVersion: '0.0.0-stub',
        chunks: ['_tinkoff_dippy_lib_di_es_js_client.chunk.xxxxx.js'],
      },
    ]);
  });

  it('multiple Child Apps and different shared modules', () => {
    // mock
    const sharedScope = {
      [mocks.sharedScope.tramvaiCoreFromHostLatest.name]: {
        [mocks.sharedScope.tramvaiCoreFromHostLatest.version]: {
          ...mocks.sharedScope.dippyFromHostLatestLow,
        },
        [mocks.sharedScope.tramvaiCoreFromChildLatest.version]: {
          ...mocks.sharedScope.tramvaiCoreFromChildLatest,
        },
        [mocks.sharedScope.tramvaiCoreFromChildOld.version]: {
          ...mocks.sharedScope.tramvaiCoreFromChildOld,
          from: 'child-app:footer:0.0.0-stub',
        },
      },
      [mocks.sharedScope.dippyFromHostOld.name]: {
        [mocks.sharedScope.dippyFromHostOld.version]: {
          ...mocks.sharedScope.dippyFromHostOld,
        },
        [mocks.sharedScope.dippyFromChildLatest.version]: {
          ...mocks.sharedScope.dippyFromChildLatest,
        },
        [mocks.sharedScope.dippyFromChildLatestHigh.version]: {
          ...mocks.sharedScope.dippyFromChildLatestHigh,
          from: 'child-app:footer:0.0.0-stub',
        },
      },
    } satisfies ModuleFederationSharedScope;
    const preloadedConfigs: ChildAppFinalConfig[] = [
      mocks.preloadedConfigs.header,
      mocks.preloadedConfigs.footer,
    ];
    const loader = {
      getStats(config: ChildAppFinalConfig) {
        if (config.name === 'header') {
          return createStats([
            mocks.sharedModules.headerTramvaiCoreLatest,
            mocks.sharedModules.headerDippyLatest,
          ]);
        }
        if (config.name === 'footer') {
          return createStats([
            {
              ...mocks.sharedModules.headerTramvaiCoreOld,
              chunks: ['core_lib_index_es_js-_08520_client.chunk.yyyyyy.js'],
            },
            {
              ...mocks.sharedModules.headerDippyLatest,
              chunks: ['_tinkoff_dippy_lib_di_es_js_client.chunk.yyyyyy.js'],
            },
          ]);
        }
      },
    } as any as ServerLoader;

    // prepare
    const sharedScopeItems = getFlatSharedScopeItemsList(sharedScope);
    const sharedModules = getFlatSharedModulesList({
      preloadedConfigs,
      loader,
    });

    // run
    const result = resolveBestSharedModules({
      sharedModules,
      sharedScopeItems,
    });

    // assert
    expect(result).toStrictEqual([
      {
        childAppName: undefined,
        childAppVersion: undefined,
        chunks: undefined,
        eager: true,
        from: 'application:root-app:0.0.0-stub',
        shareKey: '@tramvai/core',
        version: '5.0.5',
      },
      {
        childAppName: 'footer',
        childAppVersion: '0.0.0-stub',
        chunks: ['_tinkoff_dippy_lib_di_es_js_client.chunk.yyyyyy.js'],
        eager: false,
        from: 'child-app:footer:0.0.0-stub',
        shareKey: '@tinkoff/dippy',
        version: '0.10.4',
      },
      {
        childAppName: 'footer',
        childAppVersion: '0.0.0-stub',
        chunks: ['core_lib_index_es_js-_08520_client.chunk.yyyyyy.js'],
        eager: false,
        from: 'child-app:footer:0.0.0-stub',
        shareKey: '@tramvai/core',
        version: '3.0.1',
      },
    ]);
  });
});
