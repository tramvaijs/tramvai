import type { CHILD_APP_DI_MANAGER_TOKEN } from '@tramvai/tokens-child-app';
import {
  type CHILD_APP_COMMAND_LINE_RUNNER_TOKEN,
  type CHILD_APP_PRELOAD_MANAGER_TOKEN,
} from '@tramvai/tokens-child-app';
import type { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';

export const runCommand = async ({
  status,
  forcePreload,
  runner,
  preloader,
  diManager,
  pageService,
}: {
  status: string;
  forcePreload: boolean;
  runner: typeof CHILD_APP_COMMAND_LINE_RUNNER_TOKEN;
  preloader: typeof CHILD_APP_PRELOAD_MANAGER_TOKEN;
  diManager: typeof CHILD_APP_DI_MANAGER_TOKEN;
  pageService: typeof PAGE_SERVICE_TOKEN;
}) => {
  const childApps = preloader.getPreloadedList();

  await Promise.all(
    childApps.map(async (config) => {
      if (forcePreload) {
        // need to wait while actual child-app is loaded in case it wasn't preloaded before
        await preloader.preload(config, pageService.getCurrentRoute());
      }

      return runner.run('client', status, config);
    })
  );
};
