import type { ExtendedModule, ModuleType } from './module.h';
import { ModuleWalker, INVALID_MODULE_ERROR } from './ModuleWalker';

export { INVALID_MODULE_ERROR };

export const walkOfModules = (modules: Array<ModuleType | ExtendedModule>) => {
  const moduleWalker = new ModuleWalker();

  return moduleWalker.walk(modules);
};
