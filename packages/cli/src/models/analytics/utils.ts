import { FeaturesProperties, ProjectProperties } from './analytics';
import { ConfigEntry } from '../../typings/configEntry/common';
import { ConfigManager } from '../config';
import { ApplicationConfigEntry, ChildAppConfigEntry } from '../../api';

const projectCache: { [key: string]: ProjectProperties } = {};
const featuresCache: { [key: string]: FeaturesProperties } = {};

const safeRequireResolve = (path: string) => {
  try {
    return require.resolve(path);
  } catch (error) {
    return null;
  }
};

export function getProjectProperties({
  parameters,
  configManager,
}: {
  parameters: { target?: string };
  configManager: ConfigManager;
}): ProjectProperties {
  const projectName = parameters.target ?? 'unknown';
  let project: ConfigEntry;

  if (projectCache[projectName]) {
    return projectCache[projectName];
  }

  try {
    project = configManager.getProject(projectName);
  } catch (error) {
    // do nothing
  }

  projectCache[projectName] = {
    name: project.name,
    type: project?.type ?? 'unknown',
  };

  return projectCache[projectName];
}

export function getFeaturesProperties({
  parameters,
  configManager,
}: {
  parameters: { target?: string };
  configManager: ConfigManager;
}): FeaturesProperties {
  const projectName = parameters.target ?? 'unknown';
  let project: ConfigEntry;

  if (featuresCache[projectName]) {
    return featuresCache[projectName];
  }

  try {
    project = configManager.getProject(projectName);
  } catch (error) {
    // do nothing
  }

  featuresCache[projectName] = {};

  if (project) {
    if (project.type === 'application') {
      const applicationProject = project as ApplicationConfigEntry;
      const transpilationLoader = applicationProject.experiments?.transpilation?.loader;

      featuresCache[projectName].swc =
        // @ts-expect-error incorrect branded type
        (transpilationLoader === 'swc' ||
          transpilationLoader?.development === 'swc' ||
          transpilationLoader?.production === 'swc') ??
        false;

      featuresCache[projectName].fileSystemRouting =
        applicationProject.fileSystemPages?.enabled ?? false;

      featuresCache[projectName].reactCompiler =
        !!applicationProject.experiments?.reactCompiler ?? false;

      featuresCache[projectName].devTools = !!safeRequireResolve('@tramvai/module-dev-tools');

      featuresCache[projectName].moduleImage = !!safeRequireResolve(
        '@tramvai-tinkoff/module-image'
      );

      featuresCache[projectName].modulePwa = !!safeRequireResolve(
        '@tramvai/module-progressive-web-app'
      );

      featuresCache[projectName].viewTransitions =
        !!applicationProject.experiments?.viewTransitions ?? false;

      featuresCache[projectName].transitionsRouterProvider =
        !!(
          applicationProject.experiments?.viewTransitions ||
          applicationProject.experiments?.reactTransitions
        ) ?? false;
    }

    if (project.type === 'child-app') {
      const childAppProject = project as ChildAppConfigEntry;
      const transpilationLoader = childAppProject.experiments?.transpilation?.loader;

      featuresCache[projectName].swc =
        // @ts-expect-error incorrect branded type
        (transpilationLoader === 'swc' ||
          transpilationLoader?.development === 'swc' ||
          transpilationLoader?.production === 'swc') ??
        false;

      featuresCache[projectName].reactCompiler =
        !!childAppProject.experiments?.reactCompiler ?? false;
    }
  }

  return featuresCache[projectName];
}
