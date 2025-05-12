import flatten from '@tinkoff/utils/array/flatten';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import { Container, Scope } from '@tinkoff/dippy';
import { getModuleParameters, walkOfModules } from '@tramvai/core';
import type {
  CHILD_APP_CONTRACT_MANAGER,
  CHILD_APP_ROOT_DI_ACCESS_MODE_TOKEN,
  ChildApp,
  ChildAppDiManager,
  ChildAppFinalConfig,
  ChildAppLoader,
} from '@tramvai/tokens-child-app';
import { IS_CHILD_APP_DI_TOKEN } from '@tramvai/tokens-child-app';
import { CHILD_APP_INTERNAL_ROOT_DI_BORROW_TOKEN } from '@tramvai/tokens-child-app';
import { CHILD_APP_INTERNAL_ACTION_TOKEN } from '@tramvai/tokens-child-app';
import { CHILD_APP_INTERNAL_CONFIG_TOKEN } from '@tramvai/tokens-child-app';
import type { LOGGER_TOKEN } from '@tramvai/tokens-common';
import { getChildProviders } from './child/singletonProviders';
import { validateChildAppProvider } from './child/validate';
import { shouldIsolateDi } from './isolatedDi';

type RootDiAccessMode = ExtractDependencyType<typeof CHILD_APP_ROOT_DI_ACCESS_MODE_TOKEN>;
type ContractManager = ExtractDependencyType<typeof CHILD_APP_CONTRACT_MANAGER>;

export class SingletonDiManager implements ChildAppDiManager {
  private readonly log: ReturnType<typeof LOGGER_TOKEN>;
  private appDi: Container;
  private loader: ChildAppLoader;
  private rootDiAccessMode?: RootDiAccessMode | null;
  private contractManager: ContractManager;
  private cache = new Map<string, Container>();
  private moduleCache = new WeakMap<ChildApp, string>();

  constructor({
    logger,
    appDi,
    loader,
    rootDiAccessMode,
    contractManager,
  }: {
    logger: typeof LOGGER_TOKEN;
    appDi: Container;
    loader: ChildAppLoader;
    rootDiAccessMode?: RootDiAccessMode | null;
    contractManager: ContractManager;
  }) {
    this.log = logger('child-app:singleton-di-manager');
    this.appDi = appDi;
    this.loader = loader;
    this.rootDiAccessMode = rootDiAccessMode;
    this.contractManager = contractManager;
  }

  getChildDi(config: ChildAppFinalConfig) {
    const { key, tag } = config;

    if (this.cache.has(key)) {
      const children = this.loader.get(config);

      // When Child App script is evicted from server loader cache, we get a memory leak,
      // because providers in singleton child DI will store a reference to removed script,
      // and server loader cache will contain a new instance of the same script.
      // To solve this case, we will try to create a new singleton child DI
      // when new Child App script instance is fetched and compiled.
      if (children && this.moduleCache.has(children) && this.moduleCache.get(children) === key) {
        return this.cache.get(key);
      }

      this.cache.delete(key);
    }

    try {
      const di = this.resolveDi(config);

      if (di && tag !== 'debug') {
        this.cache.set(key, di);
      }

      return di;
    } catch (error: any) {
      this.log.error({
        event: 'resolve-di-fail',
        error,
        config,
      });
    }
  }

  forEachChildDi(cb: (di: Container) => void) {
    this.cache.forEach((di) => {
      cb(di);
    });
  }

  private resolveDi(config: ChildAppFinalConfig) {
    const children = this.loader.get(config);

    if (!children) {
      return;
    }

    const { modules = [], providers = [], actions = [] } = children;
    const isolateDi = this.rootDiAccessMode
      ? shouldIsolateDi(config, this.rootDiAccessMode)
      : false;
    let di: Container;

    if (isolateDi) {
      di = new Container([
        {
          provide: CHILD_APP_INTERNAL_CONFIG_TOKEN,
          useValue: config,
        },
        {
          provide: IS_CHILD_APP_DI_TOKEN,
          useValue: true,
        },
      ]);
    } else {
      di = new Container(
        [
          {
            provide: CHILD_APP_INTERNAL_CONFIG_TOKEN,
            useValue: config,
          },
          {
            provide: IS_CHILD_APP_DI_TOKEN,
            useValue: true,
          },
        ],
        this.appDi
      );
    }

    const statsLoadable =
      'getLoadableStats' in this.loader ? (this.loader as any).getLoadableStats(config) : undefined;

    // add providers on the Singleton Level to make it possible to reuse providers from the root-app Container
    const childProviders = getChildProviders(this.appDi, statsLoadable);

    childProviders.forEach((provider) => {
      di.register(provider);
    });

    const resolvedModules = walkOfModules(modules);

    resolvedModules.forEach((mod) => {
      const moduleParameters = getModuleParameters(mod);

      moduleParameters.providers.forEach((provider) => {
        di.register(provider);
      });
    });
    providers.forEach((provider) => {
      if (process.env.NODE_ENV === 'development') {
        validateChildAppProvider(provider);
      }

      di.register(provider);
    });

    di.register({
      provide: CHILD_APP_INTERNAL_ACTION_TOKEN,
      multi: true,
      useValue: actions,
    });

    if (isolateDi) {
      this.contractManager.registerChildContracts(di);
      this.contractManager.validateChildProvidedContracts(di);
    }

    const borrowTokens = di.get({ token: CHILD_APP_INTERNAL_ROOT_DI_BORROW_TOKEN, optional: true });

    if (borrowTokens) {
      flatten(borrowTokens).forEach((token) => {
        di.borrowToken(this.appDi, token);
      });
    }

    this.moduleCache.set(children, config.key);

    return di;
  }
}
