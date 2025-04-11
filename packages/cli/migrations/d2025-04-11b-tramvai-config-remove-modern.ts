// eslint-disable-next-line import/no-extraneous-dependencies
import { Api } from '@tramvai/tools-migrate';

function removeModern(projects) {
  for (const projectName in projects) {
    delete projects[projectName].modern;
  }
}

export default async (api: Api) => {
  const {
    tramvaiJSON: { source: config },
  } = api;

  removeModern(config.projects);
};
