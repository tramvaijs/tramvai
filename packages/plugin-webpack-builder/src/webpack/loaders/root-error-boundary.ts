import type { LoaderDefinition } from 'webpack';
import { shouldUseReactRoot } from '@tramvai/api/lib/utils/react';

interface Options {
  path: string;
}

const COMPONENT_NAME = 'RootErrorBoundary';
const REACT_HYDRATE_ROOT_CODE = `
const { hydrateRoot } = require('react-dom/client')

hydrateRoot(
  document,
  <${COMPONENT_NAME} error={window.serverError} url={window.serverUrl} />,
);
`;
const REACT_HYDRATE_CODE = `
const { hydrate } = require('react-dom')

hydrate(
  <${COMPONENT_NAME} error={window.serverError} url={window.serverUrl} />,
  document,
);
`;

// eslint-disable-next-line func-style
const rootErrorBoundaryLoader: LoaderDefinition<Options> = function () {
  const options = this.getOptions();

  this.addDependency(options.path);

  const IMPORT_CODE = `import ${COMPONENT_NAME} from "${options.path}"\n`;
  const HYDRATION_CODE = shouldUseReactRoot() ? REACT_HYDRATE_ROOT_CODE : REACT_HYDRATE_CODE;

  return IMPORT_CODE.concat(HYDRATION_CODE);
};

export default rootErrorBoundaryLoader;
