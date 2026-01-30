import { Container } from '../Container';
import type { ExtendedModule, ModuleType } from '../modules/module.h';
import type { Provider } from '../Provider';

/** @deprecated use Container constructor instead */
export const initContainer = ({
  modules = [],
  initialProviders = [],
  providers = [],
}: {
  modules?: (ModuleType | ExtendedModule)[];
  initialProviders?: Provider[];
  providers?: Provider[];
} = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(
      'initContainer is deprecated, use Container constructor instead',
      'example: new Container({ modules, providers })'
    );
  }

  const di = new Container(initialProviders);

  di.initialize({ providers, modules });

  return di;
};
