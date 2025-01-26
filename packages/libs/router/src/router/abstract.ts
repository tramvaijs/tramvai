import isString from '@tinkoff/utils/is/string';
import isObject from '@tinkoff/utils/is/object';
import type { Url } from '@tinkoff/url';
import { parse, convertRawUrl, rawParse, rawAssignUrl, rawResolveUrl } from '@tinkoff/url';
import type {
  AsyncParallelTapableHookInstance,
  AsyncTapableHookInstance,
  SyncTapableHookInstance,
} from '@tinkoff/hook-runner';
import { TapableHooks } from '@tinkoff/hook-runner';
import type {
  Route,
  NavigateOptions,
  UpdateCurrentRouteOptions,
  Navigation,
  NavigationGuard,
  NavigationHook,
  NavigationSyncHook,
  HookName,
  Params,
  SyncHookName,
  HistoryOptions,
  RouterPlugin,
} from '../types';
import type { History } from '../history/base';
import type { RouteTree } from '../tree/tree';
import { makePath } from '../tree/utils';
import { logger } from '../logger';
import {
  makeNavigateOptions,
  normalizeTrailingSlash,
  normalizeManySlashes,
  isSameHost,
} from '../utils';

export interface Options {
  trailingSlash?: boolean;
  mergeSlashes?: boolean;
  enableViewTransitions?: boolean;

  routes?: Route[];

  onRedirect?: NavigationHook;
  onNotFound?: NavigationHook;
  onBlock?: NavigationHook;

  beforeResolve?: NavigationHook[];
  beforeNavigate?: NavigationHook[];
  afterNavigate?: NavigationHook[];

  beforeUpdateCurrent?: NavigationHook[];
  afterUpdateCurrent?: NavigationHook[];

  guards?: NavigationGuard[];

  onChange?: NavigationSyncHook[];

  defaultRedirectCode?: number;

  hooksFactory?: TapableHooks;

  plugins?: RouterPlugin[];
}

interface InternalOptions {
  history?: boolean;
  redirect?: boolean;
}

export abstract class AbstractRouter {
  protected started = false;
  protected trailingSlash = false;
  protected strictTrailingSlash = true;
  protected viewTransitionsEnabled = false;

  protected mergeSlashes = false;

  protected currentNavigation: Navigation;
  protected lastNavigation: Navigation;

  protected history: History;
  protected tree?: RouteTree;

  public readonly guards: AsyncParallelTapableHookInstance<{
    navigation: Navigation;
    allResults: Array<void | NavigateOptions | string | boolean>;
  }>;

  public readonly hooks: Map<
    HookName,
    AsyncParallelTapableHookInstance<{ navigation: Navigation }>
  >;

  public readonly syncHooks: Map<SyncHookName, SyncTapableHookInstance<{ navigation: Navigation }>>;

  public readonly navigateHook: AsyncTapableHookInstance<{
    navigateOptions: NavigateOptions | string;
  }>;

  public readonly updateHook: AsyncTapableHookInstance<{
    updateRouteOptions: UpdateCurrentRouteOptions;
  }>;

  public readonly runNavigateHook: AsyncTapableHookInstance<{ navigation: Navigation }>;
  public readonly runUpdateHook: AsyncTapableHookInstance<{ navigation: Navigation }>;
  public readonly redirectHook: AsyncTapableHookInstance<{ navigation: Navigation }>;
  public readonly notfoundHook: AsyncTapableHookInstance<{ navigation: Navigation }>;
  public readonly blockHook: AsyncTapableHookInstance<{ navigation: Navigation }>;

  protected hooksFactory: TapableHooks;

  protected plugins?: RouterPlugin[];

  private currentUuid: number;
  private hooksIndex = 0;
  private syncHooksIndex = 0;
  private guardsIndex = 0;

  // eslint-disable-next-line max-statements
  constructor({
    trailingSlash,
    mergeSlashes,
    enableViewTransitions,
    beforeResolve = [],
    beforeNavigate = [],
    afterNavigate = [],
    beforeUpdateCurrent = [],
    afterUpdateCurrent = [],
    guards = [],
    onChange = [],
    onRedirect,
    onNotFound,
    onBlock,
    hooksFactory,
    plugins,
  }: Options) {
    this.trailingSlash = trailingSlash ?? false;
    this.strictTrailingSlash = typeof trailingSlash === 'undefined';
    this.mergeSlashes = mergeSlashes ?? false;
    this.viewTransitionsEnabled = enableViewTransitions ?? false;
    this.hooksFactory = hooksFactory ?? new TapableHooks();
    this.plugins = plugins ?? [];
    this.currentUuid = 0;
    this.onRedirect = onRedirect;
    this.onNotFound = onNotFound;
    this.onBlock = onBlock;

    this.hooks = new Map([
      ['beforeResolve', this.hooksFactory.createAsyncParallel('beforeResolve')],
      ['beforeNavigate', this.hooksFactory.createAsyncParallel('beforeNavigate')],
      ['afterNavigate', this.hooksFactory.createAsyncParallel('afterNavigate')],
      ['beforeUpdateCurrent', this.hooksFactory.createAsyncParallel('beforeUpdateCurrent')],
      ['afterUpdateCurrent', this.hooksFactory.createAsyncParallel('afterUpdateCurrent')],
    ]);

    beforeResolve.forEach((hook) => this.registerHook('beforeResolve', hook));
    beforeNavigate.forEach((hook) => this.registerHook('beforeNavigate', hook));
    afterNavigate.forEach((hook) => this.registerHook('afterNavigate', hook));
    beforeUpdateCurrent.forEach((hook) => this.registerHook('beforeUpdateCurrent', hook));
    afterUpdateCurrent.forEach((hook) => this.registerHook('afterUpdateCurrent', hook));

    this.guards = this.hooksFactory.createAsyncParallel('guards');
    guards.forEach((guard) => this.registerGuard(guard));

    this.syncHooks = new Map([['change', this.hooksFactory.createSync('change')]]);
    onChange.forEach((hook) => this.registerSyncHook('change', hook));

    this.navigateHook = this.hooksFactory.createAsync('navigate');
    this.updateHook = this.hooksFactory.createAsync('update');
    this.runNavigateHook = this.hooksFactory.createAsync('runNavigate');
    this.runUpdateHook = this.hooksFactory.createAsync('runUpdate');
    this.redirectHook = this.hooksFactory.createAsync('redirect');
    this.notfoundHook = this.hooksFactory.createAsync('notfound');
    this.blockHook = this.hooksFactory.createAsync('block');

    this.navigateHook.tapPromise('router', async (_, { navigateOptions }) => {
      await this.internalNavigate(makeNavigateOptions(navigateOptions), {});
    });

    this.updateHook.tapPromise('router', async (_, { updateRouteOptions }) => {
      await this.internalUpdateCurrentRoute(updateRouteOptions, {});
    });

    this.runNavigateHook.tapPromise('router', async (_, { navigation }) => {
      // TODO navigate
      // check for redirect in new route description
      if (navigation.to.redirect) {
        return this.redirect(navigation, makeNavigateOptions(navigation.to.redirect));
      }

      await this.runGuards(navigation);

      await this.runHooks('beforeNavigate', navigation);

      this.commitNavigation(navigation);

      await this.runHooks('afterNavigate', navigation);
    });

    this.runUpdateHook.tapPromise('router', async (_, { navigation }) => {
      await this.runHooks('beforeUpdateCurrent', navigation);

      this.commitNavigation(navigation);

      await this.runHooks('afterUpdateCurrent', navigation);
    });

    this.redirectHook.tapPromise('router', async (_, { navigation }) => {
      await this.onRedirect?.(navigation);
    });
    this.notfoundHook.tapPromise('router', async (_, { navigation }) => {
      await this.onNotFound?.(navigation);
    });
    this.blockHook.tapPromise('router', async (_, { navigation }) => {
      await this.onBlock?.(navigation);
    });

    this.plugins.forEach((plugin) => {
      plugin.apply(this);
    });
  }

  protected onRedirect?: NavigationHook;
  protected onNotFound?: NavigationHook;
  protected onBlock?: NavigationHook;

  // start is using as marker that any preparation for proper work has done in the app
  // and now router can manage any navigations
  async start() {
    logger.debug({
      event: 'start',
    });

    this.started = true;
  }

  getCurrentRoute() {
    // when something will try to get currentRoute while navigating, it will get route which router currently navigating
    // in case some handler supposed to load data of route or similar
    return this.currentNavigation?.to ?? this.lastNavigation?.to;
  }

  getCurrentUrl() {
    // same as getCurrentRoute
    return this.currentNavigation?.url ?? this.lastNavigation?.url;
  }

  getLastRoute() {
    return this.lastNavigation?.to;
  }

  getLastUrl() {
    return this.lastNavigation?.url;
  }

  protected commitNavigation(navigation: Navigation) {
    logger.debug({
      event: 'commit-navigation',
      navigation,
    });

    if (!navigation.history) {
      // in case we came from history do not history back to prevent infinity recursive calls
      this.history.save(navigation);
    }

    this.lastNavigation = navigation;
    this.currentNavigation = null;

    this.runSyncHooks('change', navigation);
  }

  async updateCurrentRoute(updateRouteOptions: UpdateCurrentRouteOptions) {
    await this.updateHook.callPromise({ updateRouteOptions });
  }

  protected async internalUpdateCurrentRoute(
    updateRouteOptions: UpdateCurrentRouteOptions,
    { history }: InternalOptions
  ) {
    const prevNavigation = this.currentNavigation ?? this.lastNavigation;

    if (!prevNavigation) {
      throw new Error('updateCurrentRoute should only be called after navigate to some route');
    }

    const { replace, params, navigateState } = updateRouteOptions;
    const { to: from, url: fromUrl } = prevNavigation;

    const navigation: Navigation = {
      type: 'updateCurrentRoute',
      from,
      to: this.resolveRoute({ params, navigateState }, { wildcard: true }),
      url: this.resolveUrl(updateRouteOptions),
      fromUrl,
      replace,
      history,
      navigateState,
      code: updateRouteOptions.code,
      key: this.uuid(),
    };

    logger.debug({
      event: 'update-current-route',
      updateRouteOptions,
      navigation,
    });

    await this.run(navigation);
  }

  protected async runUpdateCurrentRoute(navigation: Navigation) {
    await this.runUpdateHook.callPromise({ navigation });
  }

  async navigate(navigateOptions: NavigateOptions | string) {
    await this.navigateHook.callPromise({ navigateOptions });
  }

  protected async internalNavigate(
    navigateOptions: NavigateOptions,
    { history, redirect }: InternalOptions
  ) {
    const { url, replace, params, navigateState, code, viewTransition } = navigateOptions;
    const prevNavigation = redirect
      ? this.lastNavigation
      : this.currentNavigation ?? this.lastNavigation;

    if (!url && !prevNavigation) {
      throw new Error(
        'Navigate url should be specified and cannot be omitted for first navigation'
      );
    }

    const resolvedUrl = this.resolveUrl(navigateOptions);
    const { to: from, url: fromUrl } = prevNavigation ?? {};
    const redirectFrom = redirect ? this.currentNavigation.to : undefined;

    let navigation: Navigation = {
      type: 'navigate',
      from,
      url: resolvedUrl,
      fromUrl,
      replace,
      history,
      navigateState,
      code,
      redirect,
      redirectFrom,
      key: this.uuid(),
    };

    if (this.viewTransitionsEnabled && viewTransition !== undefined) {
      navigation.viewTransition = viewTransition;
    }

    await this.runHooks('beforeResolve', navigation);

    const to = this.resolveRoute({ url: resolvedUrl, params, navigateState }, { wildcard: true });

    if (to) {
      navigation = {
        ...navigation,
        to,
      };
    }

    logger.debug({
      event: 'navigation',
      navigation,
    });

    if (!navigation.to) {
      return this.notfound(navigation);
    }

    await this.run(navigation);
  }

  protected async runNavigate(navigation: Navigation) {
    await this.runNavigateHook.callPromise({ navigation });
  }

  protected async run(navigation: Navigation) {
    this.currentNavigation = navigation;

    if (navigation.type === 'navigate') {
      await this.runNavigate(navigation);
    }

    if (navigation.type === 'updateCurrentRoute') {
      await this.runUpdateCurrentRoute(navigation);
    }
  }

  resolve(
    resolveOptions: NavigateOptions | string,
    options?: Parameters<AbstractRouter['resolveRoute']>[1]
  ) {
    const opts = makeNavigateOptions(resolveOptions);

    return this.resolveRoute({ ...opts, url: parse(opts.url) }, options);
  }

  back(options?: HistoryOptions) {
    return this.go(-1, options);
  }

  forward() {
    return this.go(1);
  }

  async go(to: number, options?: HistoryOptions) {
    logger.debug({
      event: 'history.go',
      to,
    });

    return this.history.go(to, options);
  }

  isNavigating() {
    return !!this.currentNavigation;
  }

  async dehydrate(): Promise<Navigation> {
    throw new Error('Not implemented');
  }

  async rehydrate(navigation: Partial<Navigation>) {
    throw new Error('Not implemented');
  }

  addRoute(route: Route) {
    this.tree?.addRoute(route);
  }

  protected async redirect(navigation: Navigation, target: NavigateOptions): Promise<void> {
    logger.debug({
      event: 'redirect',
      navigation,
      target,
    });

    await this.redirectHook.callPromise({
      navigation: {
        ...navigation,
        from: navigation.to,
        fromUrl: navigation.url,
        to: null,
        url: this.resolveUrl(target),
      },
    });
  }

  protected async notfound(navigation: Navigation): Promise<void> {
    logger.debug({
      event: 'not-found',
      navigation,
    });

    await this.notfoundHook.callPromise({
      navigation,
    });
  }

  protected async block(navigation: Navigation): Promise<void> {
    logger.debug({
      event: 'blocked',
      navigation,
    });

    this.currentNavigation = null;

    if (this.onBlock) {
      await this.blockHook.callPromise({ navigation });
      return;
    }

    throw new Error('Navigation blocked');
  }

  cancel(): Navigation | void {}

  protected normalizePathname(pathname?: string) {
    let normalized = pathname;

    if (this.mergeSlashes) {
      normalized = normalizeManySlashes(normalized);
    }

    if (!this.strictTrailingSlash) {
      normalized = normalizeTrailingSlash(normalized, this.trailingSlash);
    }

    return normalized;
  }

  protected resolveUrl({ url, query = {}, params, preserveQuery, hash }: NavigateOptions) {
    const currentRoute = this.getCurrentRoute();
    const currentUrl = this.getCurrentUrl();

    const resultUrl = url ? rawResolveUrl(currentUrl?.href ?? '', url) : rawParse(currentUrl.href);

    let { pathname } = resultUrl;

    if (params) {
      if (url) {
        pathname = makePath(resultUrl.pathname, params);
      } else if (currentRoute) {
        pathname = makePath(currentRoute.path, { ...currentRoute.params, ...params });
      }
    }

    if (isSameHost(resultUrl)) {
      pathname = this.normalizePathname(pathname);
    }

    return convertRawUrl(
      rawAssignUrl(resultUrl, {
        pathname,
        search: url ? resultUrl.search : '',
        query: {
          ...(preserveQuery ? this.getCurrentUrl().query : {}),
          ...query,
        },
        hash: hash ?? resultUrl.hash,
      })
    );
  }

  protected resolveRoute(
    { url, params, navigateState }: { url?: Url; params?: Params; navigateState?: any },
    { wildcard }: { wildcard?: boolean } = {}
  ) {
    let route = url ? this.tree?.getRoute(url.pathname) : this.getCurrentRoute();

    if (wildcard && !route && url) {
      // if ordinary route not found look for a wildcard route
      route = this.tree?.getWildcard(url.pathname);
    }

    if (!route) {
      return;
    }

    // if condition is true route data not changed, so no need to create new reference for route object
    if (!params && navigateState === route.navigateState) {
      return route;
    }

    return {
      ...route,
      params: { ...route.params, ...params },
      navigateState,
    };
  }

  protected async runGuards(navigation: Navigation) {
    logger.debug({
      event: 'guards.run',
      navigation,
    });

    const results = [];

    await this.guards.callPromise({ navigation, allResults: results });

    logger.debug({
      event: 'guards.done',
      navigation,
      results,
    });

    for (const result of results) {
      if (result === false) {
        return this.block(navigation);
      }

      if (isString(result) || isObject(result)) {
        return this.redirect(navigation, makeNavigateOptions(result));
      }
    }
  }

  registerGuard(guard: NavigationGuard) {
    const untap = this.guards.tapPromise(
      guard.name ?? `guard-${this.guardsIndex++}`,
      async (_, { allResults, navigation }) => {
        try {
          const result = await guard(navigation);
          allResults.push(result);
        } catch (error) {
          logger.warn({
            event: 'guard.error',
            error,
          });
          allResults.push(undefined);
        }
      }
    );

    return untap;
  }

  protected runSyncHooks(hookName: SyncHookName, navigation: Navigation) {
    logger.debug({
      event: 'sync-hooks.run',
      hookName,
      navigation,
    });

    this.syncHooks.get(hookName).call({ navigation });

    logger.debug({
      event: 'sync-hooks.done',
      hookName,
      navigation,
    });
  }

  registerSyncHook(hookName: SyncHookName, hook: NavigationSyncHook) {
    const untap = this.syncHooks
      .get(hookName)
      .tap(hook.name ?? `sync-hook-${this.syncHooksIndex++}`, (_, { navigation }) => {
        try {
          return hook(navigation);
        } catch (error) {
          logger.warn({
            event: 'sync-hooks.error',
            error,
          });
        }
      });

    return untap;
  }

  protected async runHooks(hookName: HookName, navigation: Navigation) {
    logger.debug({
      event: 'hooks.run',
      hookName,
      navigation,
    });

    await this.hooks.get(hookName).callPromise({ navigation });

    logger.debug({
      event: 'hooks.done',
      hookName,
      navigation,
    });
  }

  registerHook(hookName: HookName, hook: NavigationHook) {
    const untap = this.hooks
      .get(hookName)
      .tapPromise(hook.name ?? `hook-${this.hooksIndex++}`, async (_, { navigation }) => {
        try {
          await hook(navigation);
        } catch (error) {
          logger.warn({
            event: 'hook.error',
            error,
          });

          // rethrow error for beforeResolve to prevent showing not found page
          // if app has problems while loading info about routes
          if (hookName === 'beforeResolve') {
            throw error;
          }
        }
      });

    return untap;
  }

  private uuid() {
    return this.currentUuid++;
  }
}
