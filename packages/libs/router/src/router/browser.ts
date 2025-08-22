import type { Options } from './abstract';
import { ClientRouter } from './client';
import type { HookName, Navigation } from '../types';
import { logger } from '../logger';
import { RouteTree } from '../tree/tree';
import { NAVIGATION_TYPE } from './constants';

const DELAY_CHECK_INTERVAL = 50;
const APPLIED_VIEW_TRANSITIONS_KEY = '_t_view_transitions';

type NavigationTypeKeys = keyof typeof NAVIGATION_TYPE;
type NavigationType = (typeof NAVIGATION_TYPE)[NavigationTypeKeys];

export class Router extends ClientRouter {
  protected delayedNavigation: Navigation;
  protected delayedPromise: Promise<void>;
  protected delayedResolve: () => void;
  protected delayedReject: (error: Error) => void;

  // Store applied view transitions, so we can apply them on back navigations
  private appliedViewTransitions: Map<number, string>;

  constructor(options: Options) {
    super(options);
    this.tree = new RouteTree(options.routes);

    this.history.setTree(this.tree);

    if (this.viewTransitionsEnabled) {
      this.restoreAppliedViewTransitions();

      window.addEventListener('pagehide', () => {
        this.saveAppliedViewTransitions();
      });
    }
  }

  async rehydrate(navigation: Navigation) {
    return this.resolveIfDelayFound(super.rehydrate(navigation));
  }

  async start() {
    await super.start();

    if (this.delayedNavigation) {
      const { delayedNavigation } = this;

      this.delayedNavigation = null;

      return this.flattenDelayedNavigation(delayedNavigation);
    }
  }

  protected async run(payload: Navigation) {
    const navigation: Navigation = { ...payload };

    const to =
      (navigation.to.redirect !== undefined
        ? this.resolve(navigation.to.redirect)?.actualPath
        : navigation.to?.actualPath) ?? '';
    const from = navigation.from?.actualPath ?? '';

    if (this.viewTransitionsEnabled && to !== from && !navigation.hasUAVisualTransition) {
      navigation.viewTransition = this.shouldApplyViewTransition(navigation, to);
      const hasNavigationType =
        !!navigation.viewTransitionTypes &&
        navigation.viewTransitionTypes.some((type) =>
          Object.values(NAVIGATION_TYPE).includes(type as NavigationType)
        );
      // add a navigation type only if it has not been provided
      if (navigation.viewTransition && !hasNavigationType) {
        const navigationType = this.getNavigationType(navigation);
        // add a navigation type to transition types
        navigation.viewTransitionTypes = navigation.viewTransitionTypes
          ? [...(navigation.viewTransitionTypes ?? []), navigationType]
          : [navigationType];
      }
    }

    // if router is not started yet delay current navigation without blocking promise resolving
    if (!this.started) {
      this.delayNavigation(navigation);
      return;
    }
    // if we have already running navigation delay current one and call it later
    if (this.currentNavigation) {
      return this.delayNavigation(navigation);
    }

    // ignore previous navigations that were put in delayedNavigation as we have more fresh navigation to execute
    if (this.delayedNavigation) {
      logger.info({
        event: 'delay-navigation-drop',
        delayedNavigation: this.delayedNavigation,
        navigation,
      });

      this.delayedNavigation = null;
    }

    return this.flattenDelayedNavigation(navigation);
  }

  protected delayNavigation(navigation: Navigation) {
    this.delayedNavigation = navigation;

    logger.info({
      event: 'delay-navigation',
      navigation,
    });

    if (this.delayedPromise) {
      return this.delayedPromise;
    }

    // resolve promise only after latest navigation has been executed
    this.delayedPromise = new Promise((resolve, reject) => {
      this.delayedResolve = resolve;
      this.delayedReject = reject;
    });

    return this.delayedPromise;
  }

  protected commitNavigation(navigation: Navigation) {
    // if we have parallel navigation do not update current url, as it outdated anyway
    if (navigation.cancelled || navigation.skipped) {
      logger.debug({
        event: 'delay-ignore-commit',
        navigation,
      });

      return;
    }

    return super.commitNavigation(navigation);
  }

  protected async runGuards(navigation: Navigation) {
    // drop checking guards if we have delayed navigation
    if (navigation.cancelled) {
      logger.debug({
        event: 'delay-ignore-guards',
        navigation,
      });
      return;
    }

    return super.runGuards(navigation);
  }

  protected async runHooks(hookName: HookName, navigation: Navigation) {
    // drop hook calls if we have an other navigation delayed
    // except only for case when current navigation already happened
    // and we should synchronize this update with app
    // (in case app has some logic for currently showing url on afterNavigate or afterRouteUpdate)
    if (navigation.cancelled && this.lastNavigation !== navigation) {
      logger.debug({
        event: 'delay-ignore-hooks',
        navigation,
      });

      return;
    }

    try {
      await super.runHooks(hookName, navigation);
    } catch (error) {
      return this.notfound(navigation);
    }
  }

  private async resolveIfDelayFound(task: Promise<any>) {
    let delayResolve: Function;
    const timer = setInterval(() => {
      if (this.delayedNavigation) {
        if (
          this.delayedNavigation.type === 'navigate' ||
          this.delayedNavigation.type === this.currentNavigation?.type
        ) {
          logger.info({
            event: 'delay-navigation-found',
            navigation: this.delayedNavigation,
          });

          // set cancelled flag
          if (this.currentNavigation) {
            this.currentNavigation.cancelled = true;
            this.currentNavigation = null;
          }

          // resolve current navigation to start new navigation asap
          delayResolve();
        } else {
          // updateCurrentRoute should happen only after currentNavigation, so resolve it first to prevent dead-lock
          this.delayedResolve();
        }
      }
    }, DELAY_CHECK_INTERVAL);

    await Promise.race([
      task,
      new Promise((resolve) => {
        delayResolve = resolve;
      }),
    ]);

    clearInterval(timer);
    delayResolve();
  }

  private async flattenDelayedNavigation(navigation: Navigation) {
    const flatten = async (nav: Navigation) => {
      await this.resolveIfDelayFound(super.run(nav));

      // if new navigation has been called while this navigation lasts
      // call new navigation execution
      if (this.delayedNavigation) {
        const { delayedNavigation } = this;

        logger.info({
          event: 'delay-navigation-run',
          navigation: delayedNavigation,
        });

        this.delayedNavigation = null;

        return flatten(delayedNavigation);
      }
    };

    return flatten(navigation)
      .then(
        () => {
          this.delayedResolve?.();
        },
        (err) => {
          this.delayedReject?.(err);
        }
      )
      .finally(() => {
        this.delayedPromise = null;
        this.delayedResolve = null;
        this.delayedReject = null;
      });
  }

  private getNavigationType(navigation: Navigation): NavigationType {
    // if it is back navigation
    if (navigation.history && navigation.isBack) {
      return NAVIGATION_TYPE.BACK;
    }

    return NAVIGATION_TYPE.FORWARD;
  }

  private shouldApplyViewTransition(navigation: Navigation, to: string) {
    const from = navigation.from?.actualPath ?? '';

    const historyState = this.history.getCurrentState();
    if (!historyState) {
      return false;
    }
    const historyIndex = historyState.index;
    const prevTransitionFrom = this.getPrevTransition(navigation);

    // handle back navigation when prev navigation was with VT enabled
    if (navigation.history && prevTransitionFrom === to) {
      return true;
    }

    if (navigation.viewTransition) {
      // add transition except history navigations with VT enabled
      !navigation.history && this.appliedViewTransitions.set(historyIndex, from);
      return true;
    }

    // handle forward navigation
    if (navigation.history && !navigation.isBack) {
      // returns true if prev navigation was with VT enabled
      return !!prevTransitionFrom;
    }

    // if we have forward navigation without VT enabled and stored val for this index
    if (!navigation.history && this.appliedViewTransitions.has(historyIndex)) {
      this.appliedViewTransitions.delete(historyIndex);
    }

    return false;
  }

  private getPrevTransition(navigation: Navigation) {
    const historyState = this.history.getCurrentState();
    if (!historyState) {
      return false;
    }
    const historyIndex = historyState.index;
    const index = navigation.history && navigation.isBack ? historyIndex : historyIndex - 1;
    return this.appliedViewTransitions.get(index);
  }

  private restoreAppliedViewTransitions() {
    try {
      const valueFromStorage = sessionStorage.getItem(APPLIED_VIEW_TRANSITIONS_KEY);

      if (valueFromStorage !== null) {
        const parsedValue = JSON.parse(valueFromStorage);

        this.appliedViewTransitions = new Map(
          Object.entries(parsedValue).map(([key, value]) => [
            Number.parseInt(key, 10),
            value as string,
          ])
        );

        return;
      }

      this.appliedViewTransitions = new Map();
    } catch (error) {
      this.appliedViewTransitions = new Map();
    }
  }

  private saveAppliedViewTransitions() {
    if (this.appliedViewTransitions.size > 0) {
      try {
        const valueToSave = {};

        for (const [key, value] of this.appliedViewTransitions) {
          valueToSave[key] = value;
        }

        sessionStorage.setItem(APPLIED_VIEW_TRANSITIONS_KEY, JSON.stringify(valueToSave));
      } catch (error) {}
    }
  }

  cancel() {
    if (!this.isNavigating()) return;

    logger.debug({
      event: 'cancelled',
      navigation: this.currentNavigation,
    });

    const cancelled = this.currentNavigation;

    this.currentNavigation.skipped = true;
    this.currentNavigation = null;

    return cancelled;
  }
}
