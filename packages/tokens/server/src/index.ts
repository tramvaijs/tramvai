import type { Server } from 'http';
import { Scope, createToken } from '@tinkoff/dippy';
import type { Papi } from '@tramvai/papi';
import type { AnyError } from '@tramvai/safe-strings';

declare module '@tramvai/papi' {
  export interface Options {
    schema?: {
      body?: unknown;
      query?: unknown;
      params?: unknown;
      headers?: unknown;
      response?: unknown;
    };
  }
}

/**
 * @description
 * Specifies base url for public papi handlers. By default equals to `/[appName]/papi`
 */
export const SERVER_MODULE_PAPI_PUBLIC_URL = createToken<string>('serverModulePapiPublicUrl', {
  scope: Scope.SINGLETON,
});

/**
 * @description
 * Specifies base url for private papi handlers. By default equals `/[appName]/private/papi`
 */
export const SERVER_MODULE_PAPI_PRIVATE_URL = createToken<string>('serverModulePapiPrivateUrl', {
  scope: Scope.SINGLETON,
});

/**
 * @description
 * Add private papi route
 */
export const SERVER_MODULE_PAPI_PRIVATE_ROUTE = createToken<Papi>('serverModulePapiPrivateRoute', {
  multi: true,
  scope: Scope.SINGLETON,
});

/**
 * @description
 * Add public papi route
 */
export const SERVER_MODULE_PAPI_PUBLIC_ROUTE = createToken<Papi>('serverModulePapiPublicRoute', {
  multi: true,
  scope: Scope.SINGLETON,
});

/**
 * @description
 * Settings for the static server
 */
export const SERVER_MODULE_STATICS_OPTIONS = createToken<ServerModuleStaticsOptions>(
  'serverModuleStaticsOptions'
);

/**
 * @description
 * Instance of nodejs `http.Server`.
 * Can be used for adding custom logic on server, like error handling, connection settings
 *
 * @example
  ```tsx
  {
    provide: commandLineListTokens.init,
    multi: true,
    useFactory: ({ server }) => {
      return function serverListen() {
        createTerminus(server, {});
      };
    },
    deps: {
      SERVER_TOKEN,
    },
  },
  ```
 */
export const SERVER_TOKEN = createToken<Server>('server');

/**
 * @description
 * Add resources for request proxying  to the app through `http-proxy-middleware`
 */
export const PROXY_CONFIG_TOKEN = createToken<ProxyConfig>('proxyConfigToken', {
  multi: true,
});

/**
 * @description
 * Override filter function when accessing papi route `/dependenciesVersion`
 */
export const DEPENDENCIES_VERSION_FILTER_TOKEN = createToken<DepsFilter>(
  'dependenciesVersionFilter'
);

/**
 * @description
 * List of the utility URLs on server (e.g. healthz and readyz)
 * Url matching is happens with a library `path-to-regexp`.
 */
export const UTILITY_SERVER_PATHS = createToken<string>('server utility paths', {
  multi: true,
  scope: Scope.SINGLETON,
});

/**
 * @description
 * Defines port to listen for utility routes
 */
export const UTILITY_SERVER_PORT_TOKEN = createToken<number>('server utility server port');

/**
 * @description
 * Custom path for liveness probe
 */
export const LIVENESS_PATH_TOKEN = createToken<string>('liveness path');

/**
 * @description
 * Custom path for readiness probe
 */
export const READINESS_PATH_TOKEN = createToken<string>('readiness path');

/**
 * @description
 * Custom function for k8s readiness, you might want to wait for something before allowing traffic to your app\
 * https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
 */
export const READINESS_PROBE_TOKEN = createToken<() => Promise<any>>('readiness-probe-fn');
/**
 * @description
 * Custom function for k8s liveness, a function accepting a state and returning a promise indicating service health\
 * https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
 */
export const LIVENESS_PROBE_TOKEN = createToken<() => Promise<any>>('liveness-probe-fn');

/**
 * @description
 * Enable Early Hints. By default return `true` when `EARLY_HINTS_ENABLED` env variable has a `"true"` value
 */
export const EARLY_HINTS_ENABLED_TOKEN = createToken<() => boolean>('early hints enabled');

/**
 * @description
 *  Provide custom error for root error boundary in case of static generation
 */
export const STATIC_ROOT_ERROR_BOUNDARY_ERROR_TOKEN = createToken<AnyError>(
  'root error boundary static error'
);

export interface ServerModuleStaticsOptions {
  path: string;
}

export type ProxyConfig =
  | {
      [key: string]:
        | string
        | {
            target: string;
            [key: string]: any;
          };
    }
  | {
      context: string | string[];
      target: string;
      [key: string]: any;
    };

export type DepsFilter = (
  deps: Record<string, string>
) => Record<string, string> | Promise<Record<string, string>>;
