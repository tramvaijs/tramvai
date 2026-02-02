// eslint-disable-next-line import/no-extraneous-dependencies
import { Api } from '@tramvai/tools-migrate';

function removeTranspileModernOnly(projects) {
  for (const projectName in projects) {
    if ('transpileOnlyModernLibs' in projects[projectName]) {
      if (projects[projectName].transpileOnlyModernLibs === false) {
        if (projects[projectName].experiments) {
          const currentTranspilationConfig = projects[projectName].experiments.transpilation ?? {};
          projects[projectName].experiments.transpilation = {
            ...currentTranspilationConfig,
            include: 'all',
          };
        } else {
          projects[projectName].experiments = {
            transpilation: {
              include: 'all',
            },
          };
        }
      }

      delete projects[projectName].transpileOnlyModernLibs;
    }
  }
}

export default async (api: Api) => {
  const {
    tramvaiJSON: { source: config },
  } = api;

  removeTranspileModernOnly(config.projects);
};
