import type { Container, ExtractDependencyType } from '@tinkoff/dippy';
import { ChildContainer } from '@tinkoff/dippy';
import {
  type ChildAppDiManager,
  type ChildAppLoader,
  type ChildAppFinalConfig,
  type CHILD_APP_ROOT_DI_ACCESS_MODE_TOKEN,
  type CHILD_APP_CONTRACT_MANAGER,
} from '@tramvai/tokens-child-app';
import { shouldIsolateDi } from './isolatedDi';

type RootDiAccessMode = ExtractDependencyType<typeof CHILD_APP_ROOT_DI_ACCESS_MODE_TOKEN>;

export class DiManager implements ChildAppDiManager {
  private appDi: Container;
  private loader: ChildAppLoader;
  private singletonDiManager: ChildAppDiManager;
  private rootDiAccessMode?: RootDiAccessMode | null;
  private cache = new Map<string, Container>();
  constructor({
    appDi,
    loader,
    singletonDiManager,
    rootDiAccessMode,
  }: {
    appDi: Container;
    loader: ChildAppLoader;
    singletonDiManager: ChildAppDiManager;
    rootDiAccessMode?: RootDiAccessMode | null;
  }) {
    this.appDi = appDi;
    this.loader = loader;
    this.singletonDiManager = singletonDiManager;
    this.rootDiAccessMode = rootDiAccessMode;
  }

  getChildDi(config: ChildAppFinalConfig) {
    const { key } = config;

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const di = this.resolveDi(config);

    di && this.cache.set(key, di);

    return di;
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

    const singletonDi = this.singletonDiManager.getChildDi(config);

    if (!singletonDi) {
      return;
    }

    // everything is Singleton on client-side, provide the same behaviour as for Root DI - only one container per Child App
    if (typeof window !== 'undefined') {
      return singletonDi;
    }

    const isolateDi = this.rootDiAccessMode
      ? shouldIsolateDi(config, this.rootDiAccessMode)
      : false;
    let di: ChildContainer;

    if (isolateDi) {
      di = new ChildContainer(singletonDi);
    } else {
      di = new ChildContainer(singletonDi, this.appDi);
    }

    return di;
  }
}
