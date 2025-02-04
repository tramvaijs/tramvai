import type {
  Container,
  Provider,
  ModuleType,
  ExtendedModule,
  ModuleParameters,
} from '@tinkoff/dippy';
import {
  createContainer,
  getModuleParameters,
  isExtendedModule,
  MODULE_PARAMETERS,
  Scope,
  walkOfModules,
} from '@tinkoff/dippy';
import type { Bundle } from '@tramvai/tokens-core';
import {
  ACTIONS_LIST_TOKEN,
  BUNDLE_LIST_TOKEN,
  MODULES_LIST_TOKEN,
  APP_INFO_TOKEN,
  COMMAND_LINE_RUNNER_TOKEN,
} from '@tramvai/tokens-core';
import { LOGGER_TOKEN } from '@tramvai/tokens-common';

interface AppOptions {
  name: string;
  modules?: (ModuleType | ExtendedModule)[];
  bundles?: Record<string, () => Promise<{ default: Bundle }>>;
  actions?: any;
  providers?: Provider[];
}

function appProviders(
  name: AppOptions['name'],
  bundles: AppOptions['bundles'],
  actions: AppOptions['actions'],
  modules: AppOptions['modules']
) {
  return [
    {
      // Информация о приложении
      provide: APP_INFO_TOKEN,
      scope: Scope.SINGLETON,
      useValue: {
        appName: name,
      },
    },
    {
      // Список бандлов
      provide: BUNDLE_LIST_TOKEN,
      scope: Scope.SINGLETON,
      useValue: bundles,
    },
    {
      // Список переданных экшенов
      provide: ACTIONS_LIST_TOKEN,
      scope: Scope.SINGLETON,
      useValue: actions,
      multi: true,
    },
    {
      // Спислок переданных модулей
      provide: MODULES_LIST_TOKEN,
      scope: Scope.SINGLETON,
      useValue: modules,
    },
  ];
}

export class App {
  di: Container;

  private modulesToResolve: Set<ModuleType>;

  constructor({ name, modules = [], bundles = {}, actions = [], providers }: AppOptions) {
    this.di = createContainer();
    this.modulesToResolve = new Set<ModuleType>();

    this.walkOfProviders(appProviders(name, bundles, actions, modules));

    walkOfModules(modules).forEach((mod) => {
      const moduleParameters = getModuleParameters(mod);

      this.modulesToResolve.add(isExtendedModule(mod) ? mod.mainModule : mod);

      this.walkOfProviders(moduleParameters.providers);
    });

    if (providers) {
      this.walkOfProviders(providers);
    }
  }

  async initialization(env: 'server' | 'client', type = 'init' as const) {
    if (
      typeof window !== 'undefined' &&
      !(window as any).__TRAMVAI_HTML_READY__ &&
      (window as any).__TRAMVAI_HTML_READY_PROMISE__
    ) {
      await Promise.race([
        (window as any).__TRAMVAI_HTML_READY_PROMISE__,
        new Promise<void>((resolve) => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            document.addEventListener('readystatechange', () => {
              if (document.readyState === 'complete') {
                resolve();
              }
            });
          }
        }),
      ]);
    }

    const logger = this.di.get({ token: LOGGER_TOKEN, optional: true });
    const log = logger?.('tramvai-core');
    const commandLineRunner = this.di.get({ token: COMMAND_LINE_RUNNER_TOKEN, optional: true });

    if (!commandLineRunner) {
      const error = new Error(
        '`COMMAND_LINE_RUNNER_TOKEN` is not defined, have you added `@tramvai/module-common` to your dependency list?'
      );

      if (process.env.NODE_ENV !== 'production') {
        try {
          this.di.get(COMMAND_LINE_RUNNER_TOKEN);
        } catch (e: any) {
          if (e?.message) {
            error.message += `\n\nProvider resolve error:\n${e.message}`;
          }
        }
      }

      throw error;
    }

    log?.warn({
      event: 'tramvai-app-init',
      message: 'Initializing. Run CommandLineRunner.',
    });

    const di = await commandLineRunner.run(env, type);

    log?.warn({
      event: 'tramvai-app-init',
      message: 'CommandLineRunner executed successfully. Resolving modules.',
    });

    this.resolveModules();

    log?.warn({
      event: 'tramvai-app-init',
      message: 'Modules resolved successfully. Tramvai App initialized',
    });

    return di;
  }

  private walkOfProviders(providers: Provider[]) {
    providers.forEach((provide) => {
      this.di.register(provide);
    });
  }

  private resolveModules() {
    this.modulesToResolve.forEach((ModuleToResolve) => {
      // eslint-disable-next-line no-new
      new ModuleToResolve(this.resolveModuleDeps(ModuleToResolve));
    });
  }

  private resolveModuleDeps(module: ModuleType) {
    const { deps } = module[MODULE_PARAMETERS] as ModuleParameters;

    if (deps) {
      return this.di.getOfDeps(deps);
    }
  }
}

// About error handling:
// - can't use LOGGER_TOKEN - circular dependency.
// - can't use window.logger - remote reporter will be not ready at this moment.
// - but we still can log app creation errors in inline scripts with global error interceptors.

export function createApp(options: AppOptions) {
  let app: App;
  try {
    app = new App(options);
  } catch (error) {
    (error as any).appCreationError = true;
    throw error;
  }

  return app
    .initialization(typeof window === 'undefined' ? 'server' : 'client')
    .then(() => app)
    .catch((error: any) => {
      if (error instanceof Error) {
        // eslint-disable-next-line no-param-reassign
        (error as any).appCreationError = true;
      }
      throw error;
    });
}
