import type { ReactElement, ComponentType } from 'react';
import { Scope, createToken } from '@tinkoff/dippy';
import { StorageRecord } from '@tinkoff/htmlpagebuilder';
import type { UniversalErrorBoundaryFallbackProps } from '@tramvai/react';
import type { Middleware } from '@tramvai/types-actions-state-context';
import type { JSX } from 'react';
import * as ResourceSlot from './slots';

/**
 * @description
 * Token adding resources to specific render slots.
 * Used only on server and it is equivalent to usage of RESOURCES_REGISTRY.
 *
 * [Usage example](https://tramvai.dev/docs/how-to/render-add-resources)
 */
export const RENDER_SLOTS = createToken<PageResource | PageResource[]>('RENDER_SLOTS', {
  multi: true,
});

/**
 * @description
 * Token for defining additional attributes for html, body and app container. Keep in mind that:
 *  - only raw html attributes are allowed (not react or anything else, e.g. do not use className use class)
 *  - new attributes overrides old one
 *  - only text values are supported
 *
 * @example
  ```tsx
  {
    provide: HTML_ATTRS,
    useValue: {
      target: 'body',
      attrs: {
        class: 'custom-class',
      },
    },
    multi: true,
  },
  ```
 */
export const HTML_ATTRS = createToken<HtmlAttrs>('HTML_ATTRS', { multi: true });

/**
 * @deprecated use `TRAMVAI_HOOKS_TOKEN['react:render']` and `TRAMVAI_HOOKS_TOKEN['react:error']` instead
 *
 * @description
 * Add node-style callback on render event in browser.
 * Passes error instance as first argument if there was an error
 */
export const RENDERER_CALLBACK = createToken<(e?: Error) => void>('RENDERER_CALLBACK', {
  multi: true,
});

/**
 * @deprecated you can lost some of tramvai features, for example [streaming render support](https://tramvai.dev/docs/features/rendering/streaming)
 *
 * @description
 * Used as async function which overrides app render. This function may define render parameters or override render result.
 */
export const CUSTOM_RENDER =
  createToken<(content: JSX.Element) => Promise<string>>('CUSTOM_RENDER');

/**
 * @description
 * Resources registry is used only on server for registering any additional assets for browser (scripts, styles, html) which should be added to response html page
 */
export const RESOURCES_REGISTRY = createToken<ResourcesRegistry>('resourcesRegistry');

/**
 * @description
 * A string used for check of need to loading polyfills in the client browser.
 * Polyfills are always loading for browsers without module support and if browser do support modules
 * this check will called in order to find out the need of loading polyfills
 * (by default checks for Promise.prototype.finally and implementations for URL and URLSearchParams)
 *
 * [Polyfill documentation](https://tramvai.dev/docs/references/libs/main-polyfills/#how-polyfills-loading-works)
 */
export const POLYFILL_CONDITION = createToken<string>('POLYFILL_CONDITION');

/**
 * @deprecated tramvai will automatically detect React version, and use hydrateRoot API for 18+ version
 * For Strict Mode, use token `USE_REACT_STRICT_MODE`
 */
export const RENDER_MODE = createToken<RenderMode>('RENDER_MODE');

/**
 * @description add Strict Mode wrapper, more info available in documentation https://reactjs.org/docs/strict-mode.html
 */
export const USE_REACT_STRICT_MODE = createToken<boolean>('useReactStrictMode');

/**
 * @description
 * A wrapper for app render.
 * Through that token is possible to specify for example React.Context.Provider for the app
 */
export const EXTEND_RENDER = createToken<(current: ReactElement) => ReactElement>('EXTEND_RENDER', {
  multi: true,
});

/**
 * @description
 * Token for default layout for all pages - root layout
 */
export const DEFAULT_LAYOUT_COMPONENT = createToken('defaultLayoutComponent', {
  scope: Scope.SINGLETON,
});

/**
 * @description
 * Token for default header for page
 */
export const DEFAULT_HEADER_COMPONENT = createToken('defaultHeaderComponent', {
  scope: Scope.SINGLETON,
});

/**
 * @description
 * Token for default footer for page
 */
export const DEFAULT_FOOTER_COMPONENT = createToken('defaultFooterComponent', {
  scope: Scope.SINGLETON,
});

/**
 * @description
 * Token for default Error Boundary for page
 */
export const DEFAULT_ERROR_BOUNDARY_COMPONENT = createToken<
  ComponentType<UniversalErrorBoundaryFallbackProps>
>('defaultErrorBoundaryComponent');

/**
 * @description
 * Token for passing parameters for page layout
 */
export const LAYOUT_OPTIONS = createToken<LayoutOptions | LayoutOptions[]>('layoutOptions', {
  multi: true,
  scope: Scope.SINGLETON,
});

type ReactComponent = ComponentType<any>;

type Wrapper = (WrappedComponent: ReactComponent) => ReactComponent;

export interface LayoutOptions {
  components?: Record<string, ReactComponent>;
  wrappers?: Record<string, Wrapper | Wrapper[]>;
}

export interface PageResource {
  type: keyof typeof StorageRecord;
  slot: (typeof ResourceSlot)[keyof typeof ResourceSlot];
  payload: string | null;
  attrs?: Record<string, string | null>;
}

export interface ResourcesRegistry {
  register(resource: PageResource | PageResource[]): void;
  getPageResources(): PageResource[];
  prefetchInlinePageResources(): Promise<any>;
}

export type HtmlAttrs = {
  target: 'html' | 'body' | 'app';
  attrs: { [name: string]: string | boolean | Record<string, any> | number };
};

/**
 * @deprecated
 */
export type RenderMode = 'legacy' | 'strict' | 'blocking' | 'concurrent';

type ResourceInlineOptions = {
  threshold: number;
  types: (keyof typeof StorageRecord)[];
  cacheSize?: {
    /**
     * @description
     * Cache size for fetched resources
     */
    files: number;
    /**
     * @description
     * Cache size for fetched resource sizes
     */
    size: number;
    /**
     * @description
     * Cache size for disabled urls of unavailable resources
     */
    disabledUrl: number;
  };
};

/**
 * @description
 * Settings for HTML resources inlining
 * * threshold Maximum value (in bytes) of the file which are getting inlined in HTML page
 * * types Types of resources which should be inlined
 */
export const RESOURCE_INLINE_OPTIONS = createToken<ResourceInlineOptions>(
  'resourceInlineThreshold',
  { scope: Scope.SINGLETON }
);

/**
 * @description
 * Experimental switcher from ssr to client-side rendering mode
 */
export const TRAMVAI_RENDER_MODE = createToken<TramvaiRenderMode | (() => TramvaiRenderMode)>(
  'tramvaiRenderMode'
);

export type TramvaiRenderMode = 'ssr' | 'client' | 'static';

export { ResourceSlot };
export { StorageRecord as ResourceType };

export const RENDER_FLOW_AFTER_TOKEN = createToken<() => Promise<void>>('render flow after', {
  multi: true,
});

export const BACK_FORWARD_CACHE_ENABLED = createToken<boolean>('back forward cache');

export const INLINE_WEBPACK_RUNTIME = createToken<boolean>('inline webpack runtime');

export type ReactServerRenderMode = 'sync' | 'streaming' | 'blocking';

// @todo ReactServerRenderMode or () => ReactServerRenderMode
export const REACT_SERVER_RENDER_MODE = createToken<ReactServerRenderMode>('reactServerRenderMode');

export const REACT_STREAMING_RENDER_TIMEOUT = createToken<number>('react streaming render timeout');

export interface StoreSyncEvent {
  type: string;
  payload: any;
  store: string | null;
}

export const STORE_SYNC_EVENTS_SERIALIZE_TOKEN = createToken<(event: StoreSyncEvent) => string>(
  'tramvai storeSyncEventsSerialize'
);

export const STORE_SYNC_EVENTS_TOKEN = createToken<Middleware & { startStreaming: () => void }>(
  'tramvai storeSyncEventsController'
);

/**
 * Server-side part of the transport for data, which is streamed to the client after the application shell.
 *
 * Supports two kinds of data:
 * - values by key, resolved once (e.g. results of the deferred requests)
 * - ordered channels of events, buffered until the client subscribes
 *
 * Keys and channels are shared by all features, use a feature prefix, e.g. `react-query:...`
 */
export interface StreamingTransport {
  /**
   * Streams the promise result by key, response stream is kept open until it is settled.
   * Promise is rejected when it exceeds the response stream timeout (`REACT_STREAMING_RENDER_TIMEOUT`).
   * Error details (name, message, status) are sent to the client only in development mode
   */
  stream(key: string, promise: Promise<unknown>): void;
  emit(channel: string, payload: unknown): void;
  /**
   * Called when the response stream is finished
   */
  onFinish(callback: () => void): void;
}

/**
 * @description
 * Server-side streaming transport, `null` when the response is not streamed (`REACT_SERVER_RENDER_MODE` is not `streaming`)
 */
export const STREAMING_TRANSPORT_TOKEN = createToken<StreamingTransport | null>(
  'tramvai streaming transport'
);

export interface StreamedValueRejectedError extends Error {
  name: 'StreamedValueRejectedError';
  /**
   * Status of the server error, only in development mode
   */
  status?: number;
}

export interface StreamingTransportRegistry {
  /**
   * Promise for the value by key, can be requested before the value is streamed.
   * Rejected with `StreamedValueRejectedError`, with server error details only in development mode
   */
  get(key: string): Promise<unknown>;
  /**
   * Single listener per channel, already streamed events are passed immediately
   */
  subscribe(channel: string, listener: (payload: any) => void): void;
}

/**
 * @description
 * Client-side registry of streamed data
 */
export const STREAMING_TRANSPORT_REGISTRY_TOKEN = createToken<StreamingTransportRegistry>(
  'tramvai streaming transport registry'
);

export interface WebpackStats {
  assetsByChunkName: Record<string, string[]>;
  integrities?: Record<string, string>;
  namedChunkGroups?: Record<string, { name: string; chunks: string[]; assets: string[] }>;
  entrypoints: Record<string, { name: string; chunks: string[]; assets: string[] }>;
  publicPath: string;
  [key: string]: any;
}

type FetchWebpackStatsFn = () => Promise<WebpackStats>;

export const FETCH_WEBPACK_STATS_TOKEN = createToken<FetchWebpackStatsFn>('fetchWebpackStatsFn', {
  scope: Scope.SINGLETON,
});

export const ASSETS_PREFIX_TOKEN = createToken<() => string | null>('tramvai assets prefix', {
  scope: Scope.SINGLETON,
});

export const DEFAULT_ASSETS_PREFIX_TOKEN = createToken<string | null>(
  'tramvai default assets prefix',
  { scope: Scope.SINGLETON }
);
export const RETRY_HOSTNAME_MAP = createToken<Record<string, string>>(
  'tramvai retry assets hostname map'
);

export const GET_RETRY_URL = createToken<(url: string) => string>('tramvai get asset retry url');
