import {
  APPLICATION_CONFIG_FIELDS,
  APPLICATION_EXPERIMENTS_FIELDS,
  mapApplicationProjectToNewConfig,
} from './application';
import { ApplicationConfigEntry } from '../../typings/configEntry/application';

function createAccessTracker<T extends Record<string, any>>(
  obj: T,
  prefix = ''
): { proxy: T; accessed: Set<string> } {
  const accessed = new Set<string>();

  const proxy = new Proxy(obj, {
    get(target, prop) {
      if (typeof prop === 'string' && prop in target) {
        const path = prefix ? `${prefix}.${prop}` : prop;
        accessed.add(path);
        const val = (target as any)[prop];

        if (val && typeof val === 'object' && !Array.isArray(val)) {
          const child = createAccessTracker(val, path);

          // merge child accessed keys into the parent set
          return new Proxy(child.proxy, {
            get(t, p) {
              const result = Reflect.get(t, p);
              // @ts-expect-error
              for (const key of child.accessed) {
                accessed.add(key);
              }

              return result;
            },
            has(t, p) {
              if (typeof p === 'string') {
                const childPath = path ? `${path}.${p}` : String(p);
                accessed.add(childPath);
                child.accessed.add(childPath);
              }

              return Reflect.has(t, p);
            },
          });
        }

        return val;
      }

      return Reflect.get(target, prop);
    },
    has(target, prop) {
      if (typeof prop === 'string') {
        const path = prefix ? `${prefix}.${prop}` : prop;
        accessed.add(path);
      }

      return Reflect.has(target, prop);
    },
  });

  return { proxy, accessed };
}

function createFullApplicationConfig(): Required<ApplicationConfigEntry> {
  return {
    name: 'test-app',
    root: 'src',
    type: 'application',

    sourceMap: { development: true, production: true } as any,
    integrity: { enabled: true, hashFuncNames: ['sha384'], hashLoading: 'eager' },
    define: { shared: { APP: '"test"' }, development: {}, production: {} },
    generateDataQaTag: true,
    enableFillActionNamePlugin: false,
    postcss: { config: 'src/postcss.config.js', cssLocalIdentName: '[name]' as any },
    alias: { '@': './src' },
    svgo: { plugins: [{ name: 'preset-default', params: {} }] },
    imageOptimization: { enabled: true, options: {} },
    webpack: {
      resolveAlias: { stream: 'stream-browserify' },
      provide: { Buffer: ['buffer', 'Buffer'] },
      watchOptions: { poll: 1000 },
      writeToDisk: true,
      devtool: 'eval-source-map',
    },
    dedupe: { enabled: true, enabledDev: false, strategy: 'equality' as any },
    terser: { parallel: true },
    cssMinimize: 'css-minimizer',
    hotRefresh: { enabled: true, options: { overlay: false } },
    liveReload: true,
    notifications: { suppressSuccess: 'always' },
    shared: {
      defaultTramvaiDependencies: true,
      flexibleTramvaiVersions: true,
      criticalChunks: ['platform'],
      deps: ['react'],
    },
    excludesPresetEnv: ['@babel/plugin-transform-regenerator'],
    threadLoader: { workers: 2 },

    polyfill: 'src/polyfill',
    modernPolyfill: 'src/modern-polyfill',
    serverApiDir: 'src/api',
    output: { server: 'dist/server', client: 'dist/client', static: 'dist/static' },
    fileSystemPages: {
      enabled: true,
      routesDir: 'routes',
      pagesDir: 'pages',
      componentsPattern: '**/*.tsx',
    },
    splitChunks: {
      mode: 'granularChunks',
      frameworkChunk: true,
      granularChunksSplitNumber: 2,
      granularChunksMinSize: 20000,
      commonChunkSplitNumber: 3,
    },
    checkAsyncTs: { failOnBuild: true },
    externals: ['express'] as any,
    withModulesStats: true,

    experiments: {
      webpack: { cacheUnaffected: true, backCompat: false },
      minicss: { useImportModule: { development: true, production: true } as any },
      lightningcss: true,
      transpilation: {
        loader: 'babel' as any,
        include: { development: 'all', production: 'only-modern' } as any,
      },
      minifier: 'terser' as any,
      autoResolveSharedRequiredVersions: true,
      enableFillDeclareActionNamePlugin: true,
      reactCompiler: true,
      serverRunner: 'thread',
      pwa: {
        sw: { src: 'sw.ts', dest: 'sw.js', scope: '/' },
        workbox: { enabled: true as any },
        webmanifest: { name: 'Test' } as any,
        icon: { source: 'icon.png' } as any,
        meta: {} as any,
      },
      viewTransitions: true,
      reactTransitions: true,
      runtimeChunk: 'single',
    },
  };
}

describe('mapApplicationProjectToNewConfig', () => {
  it('all ApplicationConfigEntry fields are listed in the manifest', () => {
    const config = createFullApplicationConfig();
    const configKeys = Object.keys(config).sort();
    const manifestKeys = Object.keys(APPLICATION_CONFIG_FIELDS).sort();

    const unlisted = configKeys.filter((key) => !manifestKeys.includes(key));
    expect(unlisted).toEqual([]);
  });

  it('all ApplicationExperiments fields are listed in the experiments manifest', () => {
    const config = createFullApplicationConfig();
    const experimentKeys = Object.keys(config.experiments).sort();
    const manifestKeys = Object.keys(APPLICATION_EXPERIMENTS_FIELDS).sort();

    const unlisted = experimentKeys.filter((key) => !manifestKeys.includes(key));
    expect(unlisted).toEqual([]);
  });

  it('all "mapped" top-level fields are accessed during mapping', () => {
    const config = createFullApplicationConfig();
    const { proxy, accessed } = createAccessTracker(config);

    mapApplicationProjectToNewConfig('test-app', proxy, '/root');

    const mappedFields = Object.entries(APPLICATION_CONFIG_FIELDS)
      .filter(([, status]) => status === 'mapped')
      .map(([key]) => key);

    const notAccessed = mappedFields.filter((key) => !accessed.has(key));
    expect(notAccessed).toEqual([]);
  });

  it('all "mapped" experiments fields are accessed during mapping', () => {
    const config = createFullApplicationConfig();
    const { proxy, accessed } = createAccessTracker(config);

    mapApplicationProjectToNewConfig('test-app', proxy, '/root');

    const mappedFields = Object.entries(APPLICATION_EXPERIMENTS_FIELDS)
      .filter(([, status]) => status === 'mapped')
      .map(([key]) => `experiments.${key}`);

    const notAccessed = mappedFields.filter((key) => !accessed.has(key));
    expect(notAccessed).toEqual([]);
  });

  it('correctly maps all fields to the new config', () => {
    const config = createFullApplicationConfig();
    const result = mapApplicationProjectToNewConfig('test-app', config, '/root');

    // base
    expect(result.name).toBe('test-app');
    expect(result.type).toBe('application');
    expect(result.deprecatedLessSupport).toBe(true);

    // root → sourceDir
    expect(result.sourceDir).toBe('src');

    // output
    expect(result.output).toEqual({
      server: 'dist/server',
      client: 'dist/client',
      static: 'dist/static',
    });

    // sourceMap (passed through)
    expect(result.sourceMap).toEqual({ development: true, production: true });

    // fileSystemPages (passed through)
    expect(result.fileSystemPages).toEqual({
      enabled: true,
      routesDir: 'routes',
      pagesDir: 'pages',
      componentsPattern: '**/*.tsx',
    });

    // hotRefresh (passed through)
    expect(result.hotRefresh).toEqual({ enabled: true, options: { overlay: false } });

    // liveReload
    expect(result.liveReload).toBe(true);

    // svgo (passed through)
    expect(result.svgo).toEqual({ plugins: [{ name: 'preset-default', params: {} }] });

    // generateDataQaTag
    expect(result.generateDataQaTag).toBe(true);

    // imageOptimization (passed through)
    expect(result.imageOptimization).toEqual({ enabled: true, options: {} });

    // experiments.runtimeChunk → runtimeChunk
    expect(result.runtimeChunk).toBe('single');

    // experiments.viewTransitions
    expect(result.experiments?.viewTransitions).toBe(true);

    // experiments.reactTransitions
    expect(result.experiments?.reactTransitions).toBe(true);

    // experiments.lightningcss
    expect(result.experiments?.lightningcss).toBe(true);

    // experiments.reactCompiler
    expect(result.experiments?.reactCompiler).toBe(true);

    // experiments.enableFillDeclareActionNamePlugin → enableFillDeclareActionNamePlugin
    expect(result.enableFillDeclareActionNamePlugin).toBe(true);

    // experiments.autoResolveSharedRequiredVersions → shared.autoResolveSharedRequiredVersions
    // shared.flexibleTramvaiVersions → shared.autoResolveSharedRequiredVersions
    expect(result.shared?.autoResolveSharedRequiredVersions).toBe(true);

    // experiments.transpilation.include → transpilation.include
    expect(result.transpilation).toEqual({
      include: {
        development: 'all',
      },
    });

    // experiments.pwa → pwa
    expect(result.pwa).toEqual({
      workbox: {
        enabled: true,
      },
      sw: { src: 'sw.ts', dest: 'sw.js', scope: '/' },
      webmanifest: { name: 'Test' },
      icon: { source: 'icon.png' },
      meta: {},
    });

    // serverApiDir → fileSystemPapiDir (resolved)
    expect(result.fileSystemPapiDir).toBe('/root/src/api');

    // define (passed through)
    expect(result.define).toEqual({
      shared: { APP: '"test"' },
      development: {},
      production: {},
    });

    // shared (passed through + flexibleTramvaiVersions → autoResolveSharedRequiredVersions)
    expect(result.shared).toEqual({
      defaultTramvaiDependencies: true,
      flexibleTramvaiVersions: true,
      criticalChunks: ['platform'],
      deps: ['react'],
      autoResolveSharedRequiredVersions: true,
    });

    // postcss (config path stripped of root prefix)
    expect(result.postcss).toEqual({
      config: 'postcss.config.js',
      cssLocalIdentName: '[name]',
    });

    // polyfill (resolved relative to rootDir, require.resolve will fail → catch branch)
    expect(result.polyfill).toBe('/root/src/polyfill');

    // modernPolyfill (same logic)
    expect(result.modernPolyfill).toBe('/root/src/modern-polyfill');

    // dedupe (passed through)
    expect(result.dedupe).toEqual({
      enabled: true,
      enabledDev: false,
      strategy: 'equality',
    });

    // integrity (passed through)
    expect(result.integrity).toEqual({
      enabled: true,
      hashFuncNames: ['sha384'],
      hashLoading: 'eager',
    });

    // splitChunks (passed through when mode is 'granularChunks')
    expect(result.splitChunks).toEqual({
      mode: 'granularChunks',
      frameworkChunk: true,
      granularChunksSplitNumber: 2,
      granularChunksMinSize: 20000,
      commonChunkSplitNumber: 3,
    });

    // webpack.resolveAlias
    expect(result.webpack?.resolveAlias).toEqual({ stream: 'stream-browserify' });

    // webpack.provide
    expect(result.webpack?.provide).toEqual({ Buffer: ['buffer', 'Buffer'] });

    // webpack.watchOptions
    expect(result.webpack?.watchOptions).toEqual({ poll: 1000 });

    // webpack.devtool
    expect(result.webpack?.devtool).toBe('eval-source-map');

    // webpack.writeToDisk → writeToDisk
    expect(result.writeToDisk).toBe(true);

    // externals → webpack.externals
    expect(result.webpack?.externals).toEqual(['express']);
  });
});
