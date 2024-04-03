import type { ComponentType } from 'react';
import type { Container } from '@tinkoff/dippy';
import { createToken } from '@tinkoff/dippy';
import type { Route } from '@tinkoff/router';
import type { Command, PageAction } from '@tramvai/core';
import type { ActionsRegistry, INITIAL_APP_STATE_TOKEN } from '@tramvai/tokens-common';
import type { LazyComponentWrapper } from '@tramvai/react';
import type { StoreClass } from '@tramvai/state';
import type { ChunkExtractor } from '@loadable/server';
import type {
  ChildAppLoader,
  ChildAppDiManager,
  ChildAppPreloadManager,
  ChildAppCommandLineRunner,
  ChildAppRequestConfig,
  WrapperProps,
  RootStateSubscription,
  ChildAppStateManager,
  ChildAppFinalConfig,
  ChildAppRenderManager,
  ChildAppResolutionConfig,
  ResolutionConfig,
} from './types';

export * from './types';

const multiOptions = { multi: true } as const;

/**
 * @public
 * @description CommandLineRunner steps specific for child app
 */
export const commandLineListTokens = {
  // section: client processing
  customerStart: createToken<Command>('child-app customer_start', multiOptions), // Инициализация клиента
  resolveUserDeps: createToken<Command>('child-app resolve_user_deps', multiOptions), // Получение данных о клиенте
  resolvePageDeps: createToken<Command>('child-app resolve_page_deps', multiOptions), // Получение данных необходимых для роута

  // section: clear data
  clear: createToken<Command>('child-app clear', multiOptions), // Очистка данных

  // section: spa transitions
  spaTransition: createToken<Command>('child-app spa_transition', multiOptions),

  // section: after spa transitions
  afterSpaTransition: createToken<Command>('child-app after_spa_transition', multiOptions),
};

/**
 * @public
 * @description Contains child app configs that was used to figure out how to load child apps
 */
export const CHILD_APP_RESOLUTION_CONFIGS_TOKEN = createToken<
  | ChildAppResolutionConfig
  | ChildAppResolutionConfig[]
  | (() =>
      | ChildAppResolutionConfig
      | ChildAppResolutionConfig[]
      | Promise<ChildAppResolutionConfig>
      | Promise<ChildAppResolutionConfig[]>)
>('child-app resolve configs', multiOptions);

/**
 * @public
 * @description Used to resolve and extend resolution configs for child-apps
 */
export const CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN = createToken<{
  resolve(config: ChildAppRequestConfig): ResolutionConfig | undefined;
  init(): Promise<void>;
}>('child-app resolution config manager');

/**
 * @public
 * @description Used to resolve external config with urls to external code entries
 */
export const CHILD_APP_RESOLVE_CONFIG_TOKEN = createToken<
  (config: ChildAppRequestConfig) => ChildAppFinalConfig | undefined
>('child-app resolve external config');

/**
 * @public
 * @description Base url for external urls for child apps on client
 */
export const CHILD_APP_RESOLVE_BASE_URL_TOKEN = createToken<string | undefined>(
  'child-app resolve external base url'
);

/**
 * @public
 * @description Allows to preload child app for the specific page
 */
export const CHILD_APP_PRELOAD_MANAGER_TOKEN = createToken<ChildAppPreloadManager>(
  'child-app preload manager'
);

/**
 * @public
 * @description Contains child app config that was used to load current child app
 */
export const CHILD_APP_INTERNAL_CONFIG_TOKEN = createToken<ChildAppFinalConfig>(
  'child-app current config'
);

/**
 * @private
 * @description Global actions of child app
 */
export const CHILD_APP_INTERNAL_ACTION_TOKEN = createToken<PageAction | PageAction[]>(
  'child-app action',
  multiOptions
);

/**
 * @private
 * @description Registry of child app actions
 */
export const CHILD_APP_ACTIONS_REGISTRY_TOKEN = createToken<ActionsRegistry>(
  'child-app actions registry'
);

/**
 * @deprecated use CHILD_APP_INTERNAL_ROOT_STATE_ALLOWED_STORE_TOKEN
 * @public
 * @description Subscription on a root state updates
 */
export const CHILD_APP_INTERNAL_ROOT_STATE_SUBSCRIPTION_TOKEN = createToken<RootStateSubscription>(
  'child-app root state subscription',
  multiOptions
);

/**
 * @public
 * @description Root-app stores that might be used inside child-app
 */
export const CHILD_APP_INTERNAL_ROOT_STATE_ALLOWED_STORE_TOKEN = createToken<StoreClass | string>(
  'child-app root state allowed store',
  multiOptions
);

/**
 * @public
 * @description Allows to recreate token implementation the same way as in root di, but specific to child-app di
 */
export const CHILD_APP_INTERNAL_ROOT_DI_BORROW_TOKEN = createToken<any>(
  'child-app root di borrow',
  multiOptions
);

/**
 * @private
 * @description boolean flag indicating that current di if for a child-app
 */
export const IS_CHILD_APP_DI_TOKEN = createToken<boolean>('child-app isChildApp Di');

/**
 * @private
 * @description Manages Singleton-Scope DIs for every child app
 */
export const CHILD_APP_SINGLETON_DI_MANAGER_TOKEN = createToken<ChildAppDiManager>(
  'child-app singleton di manager'
);

/**
 * @private
 * @description Manages Request-Scope DIs for every child app
 */
export const CHILD_APP_DI_MANAGER_TOKEN = createToken<ChildAppDiManager>('child-app di manager');

/**
 * @private
 * @description Bridge from React render to di providers for child apps
 */
export const CHILD_APP_RENDER_MANAGER_TOKEN = createToken<ChildAppRenderManager>(
  'child-app render manager'
);

/**
 * @private
 * @description Manages state dehydration for child-app
 */
export const CHILD_APP_STATE_MANAGER_TOKEN =
  createToken<ChildAppStateManager>('child-app state manager');

/**
 * @private
 * @description Manages loading child-app resources from the external place
 */
export const CHILD_APP_LOADER_TOKEN = createToken<ChildAppLoader>('child-app loader');

/**
 * @private
 * @description Implements CommandLineRunner for child apps
 */
export const CHILD_APP_COMMAND_LINE_RUNNER_TOKEN = createToken<ChildAppCommandLineRunner>(
  'child-app command runner'
);

/**
 * @private
 * @description Stores the common server-dehydrated state for all of child apps
 */
export const CHILD_APP_COMMON_INITIAL_STATE_TOKEN = createToken<
  Record<string, typeof INITIAL_APP_STATE_TOKEN>
>('child-app initialAppState');

/**
 * @private
 * @description Used as render function for a child app. Usually implemented as a wrapper over child app render itself with an additional logic for di and connections to root app
 */
export const CHILD_APP_INTERNAL_RENDER_TOKEN =
  createToken<ComponentType<WrapperProps<any>>>('child-app render');

/**
 * @private
 * @description Instance of loadable ChunkExtractor for specific child app
 */
export const CHILD_APP_INTERNAL_CHUNK_EXTRACTOR = createToken<ChunkExtractor>(
  'child-app chunk extractor'
);

/**
 * @public
 * @description Service to work with Child Apps page components and actions
 */
export const CHILD_APP_PAGE_SERVICE_TOKEN =
  createToken<ChildAppPageService>('child-app page service');

/**
 * @public
 * @description Child Apps page components list
 */
export const CHILD_APP_PAGE_COMPONENTS_TOKEN = createToken<Record<string, ChildAppPageComponent>>(
  'child-app page components',
  { multi: true }
);

/**
 * @private
 * @description Children for `createChildApp.render` component
 */
export const CHILD_APP_RENDER_CHILDREN_TOKEN = createToken<ComponentType<{ di: Container }>>(
  'child-app render children'
);

export interface ChildAppPageService {
  resolveComponent(route?: Route): Promise<void>;
  getComponentName(route?: Route): string | void;
  getComponent(route?: Route): ChildAppPageComponent | void;
  getActions(route?: Route): PageAction[];
}

export type ChildAppPageComponent = ComponentType<{}> & {
  actions?: PageAction[];
};

export type ChildAppPageComponentDecl =
  | ChildAppPageComponent
  | LazyComponentWrapper<ChildAppPageComponent>;
