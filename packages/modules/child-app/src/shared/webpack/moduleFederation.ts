declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var __webpack_init_sharing__: (name: string) => Promise<void>;
  // eslint-disable-next-line no-var, vars-on-top
  var __webpack_share_scopes__: ModuleFederationSharedScopes;
  // eslint-disable-next-line no-var, vars-on-top
  var __webpack_share_preloaded__: {
    containerName: string;
    shareKey: string;
    version: string;
    childAppName: string;
    childAppVersion: string;
  }[];
  // eslint-disable-next-line no-var, vars-on-top
  var __remote_scope__: { _config: Record<string, string> };
}

export interface ModuleFederationSharedScopeItem {
  get: Function;
  // from contains the source app that provided the dep
  // i.e. `output.uniqueName` in the webpack config
  from: string;
  eager: boolean;
  loaded: 0 | 1 | boolean;
}

export interface ModuleFederationSharedScope {
  [packageName: string]: {
    [version: string]: ModuleFederationSharedScopeItem;
  };
}

interface ModuleFederationSharedScopes {
  default: ModuleFederationSharedScope;
  [scope: string]: ModuleFederationSharedScope;
}

export interface ModuleFederationContainer {
  init(scope: ModuleFederationSharedScopes[string]): Promise<void>;
  get<T = unknown>(name: string): Promise<T>;
}

export interface ModuleFederationSharedModule {
  chunks: string[];
  provides: Array<{
    shareScope: string;
    shareKey: string;
    requiredVersion: string;
    strictVersion: boolean;
    singleton: boolean;
    eager: boolean;
  }>;
}

export interface ModuleFederationStats {
  sharedModules: any[];
  federatedModules: Array<{
    remote: string;
    entry: string;
    sharedModules: Array<ModuleFederationSharedModule>;
    exposes: Record<string, Array<Record<string, string[]>>>;
  }>;
}

export interface LoadableStats {
  [key: string]: any;
}

export const getSharedScope = (scope = 'default') => {
  return __webpack_share_scopes__[scope];
};

export const initModuleFederation = async (
  container?: ModuleFederationContainer,
  scope = 'default'
) => {
  if (container) {
    await container.init(__webpack_share_scopes__[scope]);

    return;
  }

  if (typeof window === 'undefined') {
    // copy some logic from https://github.com/module-federation/universe/blob/02221527aa684d2a37773c913bf341748fd34ecf/packages/node/src/plugins/loadScript.ts#L66
    // to implement the same logic for loading child-app as UniversalModuleFederation
    global.__remote_scope__ = global.__remote_scope__ || { _config: {} };
  } else {
    // for easy debugging
    if (process.env.NODE_ENV === 'development') {
      window.__webpack_share_scopes__ = __webpack_share_scopes__;
    }

    // iterate over server-side preloaded shared modules
    window.__webpack_share_preloaded__?.forEach((preloaded) => {
      // Child Apps entries will register itself in the global scope with unique name after loading
      // @ts-expect-error
      const containerForPreloaded: ModuleFederationContainer = window[preloaded.containerName];

      if (containerForPreloaded) {
        // early init to register all container shared modules in share scope
        containerForPreloaded.init(__webpack_share_scopes__[scope]);

        //
        // For example, at server-side we preload two Child Apps - "base" and "router",
        // with the same shared dependency "@tramvai/core@3.4.5", and host has uncompatible "@tramvai/core@4.0.0".
        //
        // It means that MF can share any of shared "@tramvai/core@3.4.5" instance between this two Child Apps.
        //
        // But MF share scope is a singleton at server, and we can't predict which Child App will be loaded first,
        // or "base" can be resolved first at different page, and which dependency will be registered at share scope.
        //
        // When we preload used at server-side shared dependency script to prevent client-side waterfalls,
        // it can be "base/@tramvai/core@3.4.5.js" or "router/@tramvai/core@3.4.5.js"
        //
        // And here is the problem - client-side runtime logic will don't know which shared dependency was preloaded,
        // because "loaded = 1" flag is set to 1 only when the module is required from Child App entry.
        //
        // Shared dependencies registration logic described here:
        // https://github.com/webpack/webpack/blob/97d4961cd1de9c69dba0f050a63f3b56bb64fab2/lib/sharing/ShareRuntimeModule.js#L100
        // For our example it means that "@tramvai/core" from "router" will have priority, because of names comparsion - "router" > "base",
        // and "loaded" flag is absent.
        //
        // So, even if the "base/@tramvai/core@3.4.5.js" was preloaded on the server, an additional request for the "router/@tramvai/core@3.4.5.js" will occur on the client.
        // To prevent this, manually mark "base/@tramvai/core@3.4.5.js" as loaded in share scope immediately after registration.
        //
        __webpack_share_scopes__[scope][preloaded.shareKey][preloaded.version].loaded = 1;
      }
    });

    // cleanup
    window.__webpack_share_preloaded__ = [];
  }

  await __webpack_init_sharing__('default');

  // currently module federation has problems with external modules (they are marked as externals in the dev build)
  // and unfortunately react and react-dom are marked as externals in defaults
  // fill sharedScope manually here
  const shareScope = __webpack_share_scopes__[scope];

  if (!shareScope.react) {
    shareScope.react = {
      '*': {
        get: () => () => require('react'),
        from: 'application:tramvai-mf-fix',
        eager: true,
        loaded: true,
      },
    };
  }

  if (!shareScope['react-dom']) {
    shareScope['react-dom'] = {
      '*': {
        get: () => () => require('react-dom'),
        from: 'application:tramvai-mf-fix',
        eager: true,
        loaded: true,
      },
    };
  }

  if (process.env.NODE_ENV === 'development') {
    // explicitly add react/jsx-runtime to support production builds of the child-app in dev mode
    if (!shareScope['react/jsx-runtime']) {
      shareScope['react/jsx-runtime'] = {
        '*': {
          get: () => () => require('react/jsx-runtime'),
          from: 'application:tramvai-mf-fix',
          eager: true,
          loaded: true,
        },
      };
    }
  }
};

export const getModuleFederation = async (container: ModuleFederationContainer, name = 'entry') => {
  return container.get(name);
};
