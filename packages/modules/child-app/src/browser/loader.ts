import type { ChildApp } from '@tramvai/child-app-core';
import { loadModule, waitModule } from '@tinkoff/module-loader-client';
import type { ChildAppFinalConfig } from '@tramvai/tokens-child-app';
import type { LOGGER_TOKEN } from '@tramvai/tokens-common';
import { Loader } from '../shared/loader';
import type { ModuleFederationContainer } from '../shared/webpack/moduleFederation';
import { getModuleFederation, initModuleFederation } from '../shared/webpack/moduleFederation';
import type { ChildAppModuleWrapper } from '../shared/types/module';

export const getModuleFromGlobal = (entry: string): ModuleFederationContainer | undefined => {
  return (window as any)[`child-app__${entry}`];
};

export class BrowserLoader extends Loader {
  private readonly log: ReturnType<typeof LOGGER_TOKEN>;
  private readonly initializedMap = new WeakMap<ModuleFederationContainer, ChildAppModuleWrapper>();

  private map = new Map<string, Promise<ChildApp | undefined>>();

  constructor({ logger }: { logger: typeof LOGGER_TOKEN }) {
    super();

    this.log = logger('child-app:loader');
  }

  // eslint-disable-next-line max-statements
  async load(config: ChildAppFinalConfig): Promise<ChildApp | undefined> {
    const moduleName = config.name;
    const childApp = await this.get(config);

    if (childApp) {
      this.log.debug({
        event: 'load-cache',
        moduleName,
      });

      return childApp;
    }

    let container = getModuleFromGlobal(config.client.entry);

    // case when Child App is loaded, but not initialized.
    // can be caused when initalization is failed, or still in process.
    // for second case, we can try to wait initialization.
    if (container && !childApp && this.map.has(config.key)) {
      return this.map.get(config.key);
    }

    if (!container) {
      this.log.debug({
        event: 'load-fetch',
        moduleName,
      });

      const promise = (async () => {
        // `resolveOnCssFailed: true` - allow to load module without server preloading on the client-side
        await loadModule(config.client.entry, {
          cssUrl: config.css?.entry,
          resolveOnCssFailed: true,
        });

        container = getModuleFromGlobal(config.client.entry);

        if (container) {
          this.log.debug({
            event: 'load-success',
            moduleName,
          });

          await this.init(config);

          // eslint-disable-next-line @typescript-eslint/no-shadow
          const childApp = this.get(config);

          this.map.delete(config.key);

          return childApp;
        }
      })();

      this.map.set(config.key, promise);

      return promise;
    }

    this.log.error({
      event: 'load-failed',
      moduleName,
    });

    return Promise.reject(new Error(`Error resolving child-app ${moduleName}`));
  }

  async init(config: ChildAppFinalConfig): Promise<void> {
    const container = getModuleFromGlobal(config.client.entry);

    if (container) {
      this.log.debug({
        event: 'init',
        moduleName: config.name,
      });

      await initModuleFederation(container);

      const factory = (await getModuleFederation(
        container,
        'entry'
      )) as () => ChildAppModuleWrapper;
      const entry = factory();

      this.initializedMap.set(container, entry);
    }
  }

  get(config: ChildAppFinalConfig): ChildApp | undefined {
    const container = getModuleFromGlobal(config.client.entry);
    const entry = container && this.initializedMap.get(container);

    return entry && this.resolve(entry);
  }

  async waitFor(config: ChildAppFinalConfig): Promise<void> {
    this.log.debug({
      event: 'wait-for',
      moduleName: config.name,
    });

    // wait for entry chunk
    await waitModule(config.client.entry);
  }
}
