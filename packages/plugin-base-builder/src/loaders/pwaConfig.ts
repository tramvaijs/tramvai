import type { LoaderDefinition } from 'webpack';
import { SimplifiedPWAConfig } from '../types';

interface Options {
  pwaConfigs: SimplifiedPWAConfig[];
  workboxEnabled: boolean;
  manifestEnabled: boolean;
  pwaScopes: string[];
}

// eslint-disable-next-line func-style
const pwaConfig: LoaderDefinition<Options> = function () {
  const { pwaConfigs, workboxEnabled, manifestEnabled, pwaScopes } = this.getOptions();

  this.cacheable(true);

  return `export const pwaConfigs = ${JSON.stringify(pwaConfigs)};
export const workboxEnabled = ${JSON.stringify(workboxEnabled)};
export const manifestEnabled = ${JSON.stringify(manifestEnabled)};
export const pwaScopes = ${JSON.stringify(pwaScopes)};
`;
};

export default pwaConfig;
