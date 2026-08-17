/* eslint-disable no-nested-ternary */
/* eslint-disable max-nested-callbacks */
/* eslint-disable max-statements */
import type {
  Compiler,
  ModuleFederationPluginV1Options,
  StatsChunk,
  StatsCompilation,
  StatsModule,
  WebpackPluginInstance,
  SharedConfig,
  SharedObject,
} from '@rspack/core';
import { sources } from '@rspack/core';

// Plugin from moduleFederation repo - https://github.com/module-federation/core/blob/main/packages/node/src/plugins/ChunkCorrelationPlugin.js
// Rewrited for rspack, main difference other shared module naming
// Webpack - consume-shared-module|default|@tinkoff/dippy|^1.0.0|true|/node_modules/@tinkoff/dippy/lib/di.es.js|false|false
// Rspack - consume shared module (default) @tinkoff/dippy@^1.0.0 (strict) (fallback: /node_modules/@tinkoff/dippy/lib/di.es.js)
const PLUGIN_NAME = 'FederationStatsPlugin';

type ModuleId = string | number;

type SharedModule = {
  chunks: string[];
  provides: SharedConfig[];
};

type ExposedChunk = {
  files: string[];
  requiredModules: Array<string | undefined>;
};

type Exposed = Record<string, ExposedChunk>;

type FederatedContainer = {
  remote: string;
  entry: string;
  sharedModules: SharedModule[];
  exposes: Record<string, Exposed | string[]>;
  remoteModules: Record<string, ModuleId>;
};

type FederatedStats = {
  sharedModules: SharedModule[];
  federatedModules: FederatedContainer[];
};

interface FederationStatsPluginOptions {
  filename: string | string[];
  exposes?: string;
  shared: SharedObject;
}

type FederationPlugin = WebpackPluginInstance & {
  _options?: ModuleFederationPluginV1Options;
};

const getModules = (stats: StatsCompilation): StatsModule[] => stats.modules ?? [];

const getChunks = (stats: StatsCompilation): StatsChunk[] => stats.chunks ?? [];

const getPublicPath = (stats: StatsCompilation): string =>
  stats.publicPath === 'auto' ? '' : stats.publicPath || '';

const getRemoteModules = (stats: StatsCompilation): Record<string, ModuleId> =>
  getModules(stats)
    .filter(
      (
        module
      ): module is StatsModule & {
        nameForCondition: string;
        id: ModuleId;
      } =>
        module.moduleType === 'remote-module' &&
        typeof module.nameForCondition === 'string' &&
        (typeof module.id === 'string' || typeof module.id === 'number')
    )
    .reduce<Record<string, ModuleId>>((result, remoteModule) => {
      result[remoteModule.nameForCondition] = remoteModule.id;
      return result;
    }, {});

const getExposedModules = (stats: StatsCompilation, exposedFile: string): StatsModule[] =>
  getModules(stats).filter((module) => module.name?.startsWith(exposedFile));

const getExposed = (stats: StatsCompilation, module: StatsModule): Exposed => {
  const chunks = getChunks(stats).filter((chunk) =>
    chunk.modules?.some(
      (moduleInChunk) => moduleInChunk.id === module.id && !moduleInChunk.dependent
    )
  );

  const dependencies = getModules(stats)
    .filter(
      (sharedModule) =>
        sharedModule.moduleType === 'consume-shared-module' && sharedModule.issuerId === module.id
    )
    .map((sharedModule) => sharedModule.identifier?.split('|')[2]);

  return chunks.reduce<Exposed>((result, chunk) => {
    result[String(chunk.id)] = {
      files: (chunk.files ?? []).map((file) => `${getPublicPath(stats)}${file}`),
      requiredModules: dependencies,
    };

    return result;
  }, {});
};

const searchIssuer = (module: StatsModule, check: (issuer: string) => boolean): boolean => {
  if (module.issuer && check(module.issuer)) {
    return true;
  }

  return module.modules?.some((nestedModule) => searchIssuer(nestedModule, check)) ?? false;
};

const searchReason = (
  module: StatsModule,
  check: (reasons: NonNullable<StatsModule['reasons']>) => boolean
): boolean => {
  if (module.reasons && check(module.reasons)) {
    return true;
  }

  return module.modules?.some((nestedModule) => searchReason(nestedModule, check)) ?? false;
};

const searchIssuerAndReason = (
  module: StatsModule,
  check: (value: string | undefined | null) => boolean
): boolean => {
  if (searchIssuer(module, check)) {
    return true;
  }

  return searchReason(module, (reasons) =>
    reasons.some((reason) => check(reason.moduleIdentifier))
  );
};

const getIssuers = (module: StatsModule, check: (issuer: string) => boolean): string[] => {
  if (module.issuer && check(module.issuer)) {
    return [module.issuer];
  }

  return (
    module.modules
      ?.filter((nestedModule) => searchIssuer(nestedModule, check))
      .map((nestedModule) => nestedModule.issuer)
      .filter((issuer): issuer is string => Boolean(issuer)) ?? []
  );
};

const getIssuersAndReasons = (
  module: StatsModule,
  check: (value: string | undefined | null) => boolean
): string[] => {
  if (module.issuer && check(module.issuer)) {
    return [module.issuer];
  }

  if (
    module.reasons &&
    searchReason(module, (reasons) => reasons.some((reason) => check(reason.moduleIdentifier)))
  ) {
    return module.reasons
      .map((reason) => reason.moduleIdentifier)
      .filter(
        (moduleIdentifier): moduleIdentifier is string =>
          Boolean(moduleIdentifier) && check(moduleIdentifier)
      );
  }

  return (
    module.modules
      ?.filter((nestedModule) => searchIssuerAndReason(nestedModule, check))
      .map((nestedModule) => {
        if (nestedModule.issuer) {
          return nestedModule.issuer;
        }

        return nestedModule.reasons?.find((reason) => check(reason.moduleIdentifier))
          ?.moduleIdentifier;
      })
      .filter((issuer): issuer is string => Boolean(issuer)) ?? []
  );
};

type ParsedFederatedIssuer = Omit<SharedConfig, 'singleton' | 'strictVersion'>;

const RSPACK_CONSUME_SHARED_RE = /^consume shared module \(([^)]*)\) (.+)$/;
const RSPACK_SHARED_PREFIX = 'consume shared module ';

// The main difference is in this function
// The shared module metadata parsing is updated to support the Rspack module name format
// Unfortunately, Rspack also has a bug where the strictVersion and singleton properties
// use the same (strict) label in the module name
//
// https://github.com/web-infra-dev/rspack/blob/main/crates/rspack_plugin_mf/src/sharing/consume_shared_module.rs#L63
//
// As a result, their values cannot be determined reliably from the module name alone
// To work around this limitation, the shared configuration is passed to the plugin explicitly
// The parsed shared metadata is then supplemented with the strictVersion
// and singleton values from that configuration.
function parseFederatedIssuer(issuer: string): ParsedFederatedIssuer | null {
  if (!issuer?.startsWith(RSPACK_SHARED_PREFIX)) {
    return null;
  }

  const match = RSPACK_CONSUME_SHARED_RE.exec(issuer);

  if (!match) {
    return null;
  }
  const [, shareScope, rawModuleInfo] = match;

  const moduleInfo = stripRspackSharedFlags(rawModuleInfo);
  const separator = moduleInfo.lastIndexOf('@');
  const shareKey = moduleInfo.slice(0, separator);
  const requiredVersion = moduleInfo.slice(separator + 1);

  return {
    shareScope,
    shareKey,
    requiredVersion,
    eager: /\s\(eager\)$/.test(issuer),
  };
}

function stripRspackSharedFlags(value: string): string {
  const positions = [
    value.indexOf(' (strict)'),
    value.indexOf(' (singleton)'),
    value.indexOf(' (fallback:'),
    value.indexOf(' (eager)'),
  ].filter((position) => position >= 0);

  return positions.length > 0 ? value.slice(0, Math.min(...positions)) : value;
}

function enrichSharedModule(
  parsed: ParsedFederatedIssuer,
  sharedByKey: FederationStatsPluginOptions['shared']
) {
  const config = sharedByKey[parsed.shareKey!];

  if (typeof config === 'string') {
    throw new Error('Shared for Rspack can not be string, use full object config');
  }

  const strictVersion =
    typeof config.strictVersion === 'boolean'
      ? config.strictVersion
      : config.import !== false && !config.singleton;

  return {
    ...parsed,
    strictVersion,
    singleton: config?.singleton ?? false,
  };
}

const getSharedModules = (
  stats: StatsCompilation,
  federationPluginOptions: ModuleFederationPluginV1Options
): SharedModule[] => {
  const entrypoint = stats.entrypoints?.[federationPluginOptions.name];

  if (!entrypoint) {
    return [];
  }

  return getChunks(stats)
    .filter((chunk) => entrypoint.chunks?.includes(chunk.id!))
    .flatMap((chunk) =>
      (chunk.children ?? []).flatMap((id) =>
        getChunks(stats).filter(
          (candidate) =>
            candidate.id === id &&
            (candidate.files?.length ?? 0) > 0 &&
            candidate.parents?.some((parentId) => entrypoint.chunks?.includes(parentId)) &&
            candidate.modules?.some((module) =>
              searchIssuer(module, (issuer) => issuer.startsWith('consume shared module'))
            )
        )
      )
    )
    .map<SharedModule>((chunk) => ({
      chunks: (chunk.files ?? []).map((file) => `${getPublicPath(stats)}${file}`),
      provides: (chunk.modules ?? [])
        .filter((module) =>
          searchIssuer(module, (issuer) => issuer.startsWith('consume shared module'))
        )
        .flatMap((module) =>
          getIssuers(module, (issuer) => issuer.startsWith('consume shared module'))
        )
        .map(parseFederatedIssuer)
        .filter((dependency): dependency is SharedConfig => dependency !== null),
    }))
    .filter((chunk) => chunk.provides.length > 0);
};

const getMainSharedModules = (stats: StatsCompilation): SharedModule[] => {
  const mainChunkGroup = stats.namedChunkGroups?.main;
  const chunks = mainChunkGroup
    ? (mainChunkGroup.chunks ?? []).flatMap((id) =>
        getChunks(stats).filter((chunk) => chunk.id === id)
      )
    : [];

  return chunks
    .flatMap((chunk) =>
      (chunk.children ?? []).flatMap((id) =>
        getChunks(stats).filter(
          (candidate) =>
            candidate.id === id &&
            (candidate.files?.length ?? 0) > 0 &&
            candidate.modules?.some((module) =>
              searchIssuerAndReason(
                module,
                (value) => value?.startsWith('consume shared module') ?? false
              )
            )
        )
      )
    )
    .map<SharedModule>((chunk) => ({
      chunks: (chunk.files ?? []).map((file) => `${getPublicPath(stats)}${file}`),
      provides: (chunk.modules ?? [])
        .filter((module) =>
          searchIssuerAndReason(
            module,
            (value) => value?.startsWith('consume shared module') ?? false
          )
        )
        .flatMap((module) =>
          getIssuersAndReasons(
            module,
            (issuer) => issuer?.startsWith('consume shared module') ?? false
          )
        )
        .map(parseFederatedIssuer)
        .filter((dependency): dependency is SharedConfig => dependency !== null),
    }))
    .filter((chunk) => chunk.provides.length > 0);
};

const getFederationStats = (
  stats: StatsCompilation,
  shared: SharedObject,
  federationPluginOptions: ModuleFederationPluginV1Options
): FederatedContainer => {
  const exposedModules = Object.entries(federationPluginOptions.exposes ?? {}).reduce<
    Record<string, StatsModule[]>
  >((result, [exposedAs, exposedFile]) => {
    result[exposedAs] = getExposedModules(stats, exposedFile as string);
    return result;
  }, {});

  const exposes = Object.entries(exposedModules).reduce<Record<string, Exposed>>(
    (result, [exposedAs, modules]) => {
      result[exposedAs] = modules.reduce<Exposed>(
        (exposedChunks, module) => Object.assign(exposedChunks, getExposed(stats, module)),
        {}
      );

      return result;
    },
    {}
  );

  const remote = (federationPluginOptions.library?.name ?? federationPluginOptions.name) as string;

  const assetByChunkName = stats.assetsByChunkName?.[remote];
  const entry =
    Array.isArray(assetByChunkName) && assetByChunkName.length === 1
      ? assetByChunkName[0]
      : typeof assetByChunkName === 'string'
        ? assetByChunkName
        : federationPluginOptions.filename;

  const sharedModules = getSharedModules(stats, federationPluginOptions);

  return {
    remote,
    entry: `${getPublicPath(stats)}${entry}`,
    sharedModules: sharedModules.map((sharedModule) => {
      sharedModule.provides = sharedModule.provides.map((provide) =>
        enrichSharedModule(provide, shared)
      );

      return sharedModule;
    }),
    exposes,
    remoteModules: getRemoteModules(stats),
  };
};

const isFederationPlugin = (plugin: WebpackPluginInstance): plugin is FederationPlugin => {
  const federationPluginNames = new Set([
    'NextFederationPlugin',
    'UniversalFederationPlugin',
    'NodeFederationPlugin',
    'ModuleFederationPlugin',
  ]);

  const candidate = plugin as FederationPlugin;

  return federationPluginNames.has(plugin.constructor.name) && Boolean(candidate._options?.exposes);
};

export default class FederationStatsPlugin implements WebpackPluginInstance {
  private readonly options: FederationStatsPluginOptions;

  constructor(options: FederationStatsPluginOptions) {
    if (!options?.filename) {
      throw new Error('filename option is required.');
    }

    this.options = options;
  }

  apply(compiler: Compiler): void {
    const federationPlugins = (compiler.options.plugins ?? [])
      .filter(
        (plugin): plugin is WebpackPluginInstance => Boolean(plugin) && typeof plugin !== 'function'
      )
      .filter(isFederationPlugin);

    if (federationPlugins.length === 0) {
      return;
    }

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        () => {
          const federationOptions = federationPlugins[0]?._options;

          if (!federationOptions) {
            return;
          }

          const stats = compilation.getStats().toJson({
            all: false,
            assets: true,
            reasons: true,
            modules: true,
            children: true,
            chunkGroups: true,
            chunkModules: true,
            chunkOrigins: false,
            entrypoints: true,
            chunkRelations: true,
            chunks: true,
            ids: true,
            nestedModules: false,
            outputPath: true,
            publicPath: true,
          });

          const federatedModules = getFederationStats(
            stats,
            this.options.shared,
            federationOptions
          );

          federatedModules.exposes = { entry: [] };

          const sharedModules = getMainSharedModules(stats);
          const vendorChunks = new Set<string>();

          for (const share of sharedModules) {
            for (const file of share.chunks) {
              vendorChunks.add(file);
            }
          }

          const statsResult: FederatedStats = {
            sharedModules,
            federatedModules: [federatedModules],
          };

          const statsSource = new sources.RawSource(JSON.stringify(statsResult));

          const filenames = Array.isArray(this.options.filename)
            ? this.options.filename
            : [this.options.filename];

          for (const filename of filenames) {
            if (compilation.getAsset(filename)) {
              compilation.updateAsset(filename, statsSource);
            } else {
              compilation.emitAsset(filename, statsSource);
            }
          }
        }
      );
    });
  }
}
