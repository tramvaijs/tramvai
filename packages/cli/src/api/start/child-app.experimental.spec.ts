import {
  CHILD_APP_CONFIG_FIELDS,
  CHILD_APP_EXPERIMENTS_FIELDS,
  mapChildAppProjectToNewConfig,
} from './child-app.experimental';
import type { ChildAppConfigEntry } from '../../typings/configEntry/child-app';

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

function createFullChildAppConfig(): Required<ChildAppConfigEntry> {
  return {
    name: 'test-child-app',
    root: 'src',
    type: 'child-app',

    output: 'dist/child-app',

    sourceMap: { development: true, production: true } as any,
    integrity: { enabled: true, hashFuncNames: ['sha384'], hashLoading: 'eager' },
    define: { shared: { APP: '"test"' }, development: {}, production: {} },
    generateDataQaTag: true,
    enableFillActionNamePlugin: false,
    postcss: { config: 'src/postcss.config.js', cssLocalIdentName: '[hash:base64:5]' as any },
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
    },
  };
}

describe('mapChildAppProjectToNewConfig', () => {
  it('all ChildAppConfigEntry fields are listed in the manifest', () => {
    const config = createFullChildAppConfig();
    const configKeys = Object.keys(config).sort();
    const manifestKeys = Object.keys(CHILD_APP_CONFIG_FIELDS).sort();

    const unlisted = configKeys.filter((key) => !manifestKeys.includes(key));
    expect(unlisted).toEqual([]);
  });

  it('all Experiments fields are listed in the experiments manifest', () => {
    const config = createFullChildAppConfig();
    const experimentKeys = Object.keys(config.experiments).sort();
    const manifestKeys = Object.keys(CHILD_APP_EXPERIMENTS_FIELDS).sort();

    const unlisted = experimentKeys.filter((key) => !manifestKeys.includes(key));
    expect(unlisted).toEqual([]);
  });

  it('all "mapped" top-level fields are accessed during mapping', () => {
    const config = createFullChildAppConfig();
    const { proxy, accessed } = createAccessTracker(config);

    mapChildAppProjectToNewConfig('test-child-app', proxy);

    const mappedFields = Object.entries(CHILD_APP_CONFIG_FIELDS)
      .filter(([, status]) => status === 'mapped')
      .map(([key]) => key);

    const notAccessed = mappedFields.filter((key) => !accessed.has(key));
    expect(notAccessed).toEqual([]);
  });

  it('all "mapped" experiments fields are accessed during mapping', () => {
    const config = createFullChildAppConfig();
    const { proxy, accessed } = createAccessTracker(config);

    mapChildAppProjectToNewConfig('test-child-app', proxy);

    const mappedFields = Object.entries(CHILD_APP_EXPERIMENTS_FIELDS)
      .filter(([, status]) => status === 'mapped')
      .map(([key]) => `experiments.${key}`);

    const notAccessed = mappedFields.filter((key) => !accessed.has(key));
    expect(notAccessed).toEqual([]);
  });

  it('correctly maps all fields to the new config', () => {
    const config = createFullChildAppConfig();
    const result = mapChildAppProjectToNewConfig('test-child-app', config);

    // base
    expect(result.name).toBe('test-child-app');
    expect(result.type).toBe('child-app');
    expect(result.deprecatedLessSupport).toBe(true);

    // root → sourceDir
    expect(result.sourceDir).toBe('src');

    // output (string, passed through)
    expect(result.output).toBe('dist/child-app');

    // sourceMap (passed through)
    expect(result.sourceMap).toEqual({ development: true, production: true });

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

    // experiments.enableFillDeclareActionNamePlugin → enableFillDeclareActionNamePlugin
    expect(result.enableFillDeclareActionNamePlugin).toBe(true);

    // experiments.autoResolveSharedRequiredVersions → shared.autoResolveSharedRequiredVersions
    expect(result.shared?.autoResolveSharedRequiredVersions).toBe(true);

    // experiments.transpilation.include → transpilation.include
    expect(result.transpilation).toEqual({
      include: {
        development: 'all',
      },
    });

    // shared (passed through + flexibleTramvaiVersions → autoResolveSharedRequiredVersions)
    expect(result.shared).toEqual({
      defaultTramvaiDependencies: true,
      flexibleTramvaiVersions: true,
      criticalChunks: ['platform'],
      deps: ['react'],
      autoResolveSharedRequiredVersions: true,
    });

    // dedupe (passed through)
    expect(result.dedupe).toEqual({
      enabled: true,
      enabledDev: false,
      strategy: 'equality',
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

    // define (passed through)
    expect(result.define).toEqual({
      shared: { APP: '"test"' },
      development: {},
      production: {},
    });

    // postcss (config path stripped of root prefix)
    expect(result.postcss).toEqual({
      config: 'postcss.config.js',
      cssLocalIdentName: '[hash:base64:5]',
    });

    // experiments.lightningcss
    expect(result.experiments?.lightningcss).toBe(true);

    // experiments.reactCompiler
    expect(result.experiments?.reactCompiler).toBe(true);
  });

  it('does not map fields that are skipped', () => {
    const config = createFullChildAppConfig();
    const result = mapChildAppProjectToNewConfig('test-child-app', config) as any;

    // Fields that exist in old config but NOT in new ChildAppProject
    expect(result.integrity).toBeUndefined();
    expect(result.alias).toBeUndefined();
    expect(result.terser).toBeUndefined();
    expect(result.cssMinimize).toBeUndefined();
    expect(result.notifications).toBeUndefined();
    expect(result.excludesPresetEnv).toBeUndefined();
    expect(result.threadLoader).toBeUndefined();
  });
});
