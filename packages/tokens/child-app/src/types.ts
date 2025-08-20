import type { ComponentType, ErrorInfo } from 'react';
import type { Container, ExtractDependencyType, Provider, TokenInterface } from '@tinkoff/dippy';
import type {
  CommandLines,
  CommandLineDescription,
  ModuleType,
  ExtendedModule,
  Action,
  TramvaiAction,
} from '@tramvai/core';
import type { AsyncTapableHookInstance, SyncTapableHookInstance } from '@tramvai/tokens-core';
import type { Route } from '@tinkoff/router';
import { CHILD_APP_RESOLUTION_CONFIGS_TOKEN } from '.';

export interface ChildApp {
  name: string;

  modules?: (ModuleType | ExtendedModule)[];
  actions?: Array<Action | TramvaiAction<any[], any, any>>;
  providers: Provider[];
}

export interface ChildAppRequestConfig {
  name: string;
  version?: string;
  tag?: string;
}

export interface ChildAppExternalConfig {
  server: {
    entry: string;
  };

  client: {
    baseUrl: string;
    entry: string;
    stats: string;
    statsLoadable: string;
  };

  css?: {
    entry?: string;
  };
}

export interface ChildAppReactConfig extends ChildAppRequestConfig {
  props?: Record<string, any>;
  fallback?: ComponentType<{ error?: Error }>;
}

export interface ResolutionConfig extends Partial<ChildAppExternalConfig> {
  version: string;
  withoutCss?: boolean;
  baseUrl?: string;
}

export interface ChildAppResolutionConfig {
  name: string;
  byTag: {
    latest: ResolutionConfig;
    [key: string]: ResolutionConfig;
  };
  baseUrl?: string;
}

export interface ChildAppFinalConfig
  extends Required<ChildAppRequestConfig>,
    ChildAppExternalConfig {
  key: string;
}
export interface ChildAppPreloadManager {
  preload(config: ChildAppRequestConfig, route?: Route): Promise<void>;
  prefetch(config: ChildAppRequestConfig, route?: Route): Promise<void>;
  isPreloaded(config: ChildAppRequestConfig): boolean;
  runPreloaded(): Promise<void>;
  pageRender(): void;
  clearPreloaded(): Promise<void>;
  getPreloadedList(): ChildAppFinalConfig[];
  saveNotPreloadedForSpaNavigation(config: ChildAppRequestConfig): void;
  isNotPreloadedForSpaNavigation(config: ChildAppRequestConfig): boolean;
}

export interface ChildAppRenderManager {
  getChildDi(
    request: ChildAppRequestConfig
  ): [Container | undefined, Promise<Container | undefined> | undefined];
  clear(): void;
  hooks: ChildAppRenderHooks;
}

export interface ChildAppLoader {
  load(config: ChildAppFinalConfig): Promise<ChildApp | void>;
  get(config: ChildAppFinalConfig): ChildApp | void;
  init(config: ChildAppFinalConfig): Promise<void>;
  waitFor(config: ChildAppFinalConfig): Promise<void>;
}

export interface ChildAppStateManager {
  registerChildApp(config: ChildAppFinalConfig): void;

  getState(): any;
}

export interface ChildAppDiManager {
  getChildDi(config: ChildAppFinalConfig): Container | undefined;
  forEachChildDi(callback: (di: Container) => void): void;
}

export interface ChildAppCommandLineRunner {
  run(
    type: keyof CommandLines,
    status: keyof CommandLineDescription,
    config: ChildAppFinalConfig
  ): Promise<void>;
}

export interface WrapperProps<T> {
  di: Container;
  props: T;
}

type Store = { storeName: string } | string;
type OptionalStore = { store: Store; optional?: boolean };

export interface RootStateSubscription {
  stores: Array<Store | OptionalStore>;
  listener: (state: Record<string, any>) => void;
}

export interface ChildAppContractManager {
  registerChildContracts(childDi: Container): void;
  getChildProvidedContract<T extends TokenInterface<any>>(
    childAppName: string,
    contract: T
  ): Promise<ExtractDependencyType<T> | null>;
  validateChildProvidedContracts(childDi: Container): void;
}

// TODO: for now TokenInterface always resolved as any
export type Contract = TokenInterface;

export type Contracts = Contract[];

export type ChildRequiredContracts = Contracts;

export type ChildProvidedContracts = Contracts;

export type HostProvidedContracts = {
  childAppName?: string;
  providedContracts: Contracts;
};

export type HostRequiredContracts = {
  childAppName: string;
  requiredContracts: Contracts;
};

export type ChildContractsFallback = (report: {
  missedContracts: Contract[];
  childDi: Container;
}) => void;

export type HostContractsFallback = (report: {
  missedContracts: Contract[];
  hostDi: Container;
}) => void;
export type ChildAppErrorBoundaryHandler = (
  error: Error,
  errorInfo: ErrorInfo,
  config: ChildAppRequestConfig
) => void;

export type ChildAppConfigArgs = {
  name: string;
  version: string | undefined;
  tag: string | undefined;
};

export type PreloadArgs = {
  config: ChildAppFinalConfig;
  route: Route | undefined;
};

export type RunChildAppCommandLineArgs = {
  config: ChildAppFinalConfig;
  status: string;
  line: keyof CommandLines;
};

export type ChildAppConfigResolutionHooks = {
  fetchConfig: AsyncTapableHookInstance<
    {},
    ExtractDependencyType<typeof CHILD_APP_RESOLUTION_CONFIGS_TOKEN>
  >;
};

export type ChildAppRenderHooks = {
  mounted: SyncTapableHookInstance<ChildAppConfigArgs>;
  mountFailed: SyncTapableHookInstance<ChildAppConfigArgs>;
};

export type ChildAppLoaderHooks = {
  loadModule: AsyncTapableHookInstance<{ config: ChildAppFinalConfig }, ChildApp | undefined>;
};

export type ChildAppPreloadHooks = {
  preloadChildApp: AsyncTapableHookInstance<PreloadArgs>;
  prefetchChildApp: AsyncTapableHookInstance<PreloadArgs>;
  runChildAppCommandLine: AsyncTapableHookInstance<RunChildAppCommandLineArgs>;
};

export type ChildAppRenderPlugin = {
  apply(hooks: ChildAppRenderHooks): void;
};

export type ChildAppConfigResolutionPlugin = {
  apply(hooks: ChildAppConfigResolutionHooks): void;
};

export type ChildAppPreloadManagerPlugin = {
  apply(hooks: ChildAppPreloadHooks): void;
};

export type ChildAppLoaderPlugin = {
  apply(hooks: ChildAppLoaderHooks): void;
};
