import type { ModuleType, ExtendedModule, ModuleParameters } from './module.h';
import { isValidModule } from './isValidModule';
import { getModuleParameters } from './getModuleParameters';

export const INVALID_MODULE_ERROR = 'An invalid module was passed in the list of modules';

export class ModuleWalker {
  private modulesIdInitialized = new Set<string>();
  private modulesNameInitialized = new Set<string>();
  private rootWalker?: ModuleWalker;

  constructor(rootWalker?: ModuleWalker) {
    this.rootWalker = rootWalker;
  }

  walk(modules: Array<ModuleType | ExtendedModule>) {
    const result: typeof modules = [];

    modules.forEach((mod) => this.innerWalk(mod, (module) => result.push(module)));

    return result;
  }

  hasModule(moduleParameters: ModuleParameters): boolean {
    return (
      this.modulesIdInitialized.has(moduleParameters.id) ||
      Boolean(this.rootWalker?.hasModule(moduleParameters))
    );
  }

  hasModuleName(moduleParameters: ModuleParameters): boolean {
    return (
      this.modulesNameInitialized.has(moduleParameters.name) ||
      Boolean(this.rootWalker?.hasModuleName(moduleParameters))
    );
  }

  private innerWalk(module: ModuleType | ExtendedModule, cb: (mod: typeof module) => void) {
    if (!isValidModule(module)) {
      throw new Error(INVALID_MODULE_ERROR);
    }

    const moduleParameters = getModuleParameters(module);

    if (this.hasModule(moduleParameters)) {
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      if (this.hasModuleName(moduleParameters)) {
        // eslint-disable-next-line no-console
        console.error(
          `Module ${moduleParameters.id} has already been initialized. Please note that the duplicates are likely due to packages of different versions that contain the same module. Most likely there are duplicate dependencies in the project:`,
          module,
          moduleParameters
        );
      }
    }

    this.modulesIdInitialized.add(moduleParameters.id);
    this.modulesNameInitialized.add(moduleParameters.name);

    // If the module imports other modules, then initialize their providers
    if (moduleParameters.imports) {
      moduleParameters.imports.forEach((item) => this.innerWalk(item, cb));
    }

    cb(module);
  }
}
