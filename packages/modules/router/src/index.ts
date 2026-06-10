export { NoSpaRouterModule, SpaRouterModule } from './modules/server';
export { RouterChildAppModule } from './modules/child-app';
export { Link } from './components/link';
export * from '@tramvai/tokens-router';
export { routerForRoot, generateForRoot } from './modules/utils/forRoot';
/* eslint-disable import/export */
export type { RouterState } from './stores/RouterStore';
export * from './stores/RouterStore';
/* eslint-enable import/export */
export * from './stores/PageErrorStore';
export * from './hooks/usePageService';
export { stopRunAtError } from './modules/utils/stopRunAtError';
export {
  onChangeHooksToken,
  beforeNavigateHooksToken,
  afterNavigateHooksToken,
  beforeResolveHooksToken,
  beforeUpdateCurrentHooksToken,
  afterUpdateCurrentHooksToken,
  routerBundleInfoAdditionalToken,
  routeTransformToken,
  ROUTER_VIEW_TRANSITIONS_ENABLED,
  PRERENDER_HOOKS_TOKEN,
} from './modules/tokens';
export * from '@tinkoff/router';

declare module '@tinkoff/router' {
  export interface RouteConfig {
    bundle?: string;
    pageComponent?: string;
    layoutComponent?: string;
    nestedLayoutComponent?: string;
    errorBoundaryComponent?: string;
    forceRouteResolve?: boolean;
  }
}
