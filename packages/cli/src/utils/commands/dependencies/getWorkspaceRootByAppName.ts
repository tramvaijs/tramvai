import type { Context } from '../../../models/context';

export const getWorkspaceRootByAppName = (context: Context, appName: string) => {
  return context.config.getProject(appName).root;
};
