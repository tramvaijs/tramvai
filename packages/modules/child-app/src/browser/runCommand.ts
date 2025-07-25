import type { CHILD_APP_DI_MANAGER_TOKEN } from '@tramvai/tokens-child-app';
import {
  type CHILD_APP_COMMAND_LINE_RUNNER_TOKEN,
  type CHILD_APP_PRELOAD_MANAGER_TOKEN,
} from '@tramvai/tokens-child-app';
import type { LOGGER_TOKEN } from '@tramvai/tokens-common';
import type { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';

export const runCommand = async ({
  status,
  forcePreload,
  runner,
  preloader,
  pageService,
  logger,
}: {
  status: string;
  forcePreload: boolean;
  runner: typeof CHILD_APP_COMMAND_LINE_RUNNER_TOKEN;
  preloader: typeof CHILD_APP_PRELOAD_MANAGER_TOKEN;
  diManager: typeof CHILD_APP_DI_MANAGER_TOKEN;
  pageService: typeof PAGE_SERVICE_TOKEN;
  logger: typeof LOGGER_TOKEN;
}) => {
  const childApps = preloader.getPreloadedList();
  const log = logger('child-app:run-preloaded');
  await Promise.all(
    childApps.map(async (config) => {
      if (forcePreload) {
        // need to wait while actual child-app is loaded in case it wasn't preloaded before
        await preloader.preload(config, pageService.getCurrentRoute());
      }

      // if Child Apps was not preloaded, prevent running `spa` and `afterSpa` lines for it,
      // because it trigger actions or resolveUserDeps/resolvePageDeps commands second execution on the same navigation
      if (preloader.isNotPreloadedForSpaNavigation(config)) {
        if (status === 'spa') {
          log.info({
            message:
              'Child App has been preloaded first time, current SPA-transition will not be blocked, Child App `spa` and `afterSpa` lines will be skipped',
            childApp: config,
          });
        }
        return;
      }

      return runner.run('client', status, config);
    })
  ).catch((error) => {
    log.error({
      event: 'spa-failed',
      error,
    });
  });
};
