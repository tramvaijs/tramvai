import { ConfigService } from '@tramvai/api/lib/config';
import { shouldUseReactRoot } from '@tramvai/api/lib/utils/react';

export const configToEnv = ({ config }: { config: ConfigService }) => {
  const { fileSystemPages, experiments } = config;

  return {
    'process.env.__TRAMVAI_EXPERIMENTAL_ENABLE_FILE_SYSTEM_PAGES': JSON.stringify(
      fileSystemPages!.enabled
    ),
    'process.env.__TRAMVAI_EXPERIMENTAL_FILE_SYSTEM_ROUTES_DIR': JSON.stringify(
      fileSystemPages!.routesDir
    ),
    'process.env.__TRAMVAI_EXPERIMENTAL_FILE_SYSTEM_PAGES_DIR': JSON.stringify(
      fileSystemPages!.pagesDir
    ),
    'process.env.__TRAMVAI_CONCURRENT_FEATURES': JSON.stringify(shouldUseReactRoot()),
    'process.env.__TRAMVAI_VIEW_TRANSITIONS': `'${JSON.stringify(experiments!.viewTransitions)}'`,
    'process.env.__TRAMVAI_REACT_TRANSITIONS': `'${JSON.stringify(experiments!.reactTransitions)}'`,
  };
};
