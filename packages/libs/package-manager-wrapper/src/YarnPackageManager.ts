import type {
  InstallOptions,
  PackageManagerOptions,
  RemoveOptions,
  DedupeOptions,
} from './PackageManager';
import { PackageManager } from './PackageManager';

export class YarnPackageManager extends PackageManager {
  readonly name = 'yarn';

  constructor(options: PackageManagerOptions) {
    super(options);
  }

  async install(options: InstallOptions = {}) {
    const { version, noSave, devDependency } = options;
    const packagesForInstall = this.getPackagesForInstall(options);
    const isPackagesSpecified = packagesForInstall !== '';

    const commandLineArgs = [
      'yarn',
      isPackagesSpecified && 'add',
      isPackagesSpecified && packagesForInstall,
      version && '--exact',
      noSave && '--frozen-lockfile',
      devDependency && '--dev',
      this.registryFlag(options),
    ].filter(Boolean);

    await this.run(commandLineArgs.join(' '), options);
  }

  async remove(options: RemoveOptions) {
    const { name } = options;

    const commandLineArgs = ['yarn', 'remove', name, this.registryFlag(options)].filter(Boolean);

    await this.run(commandLineArgs.join(' '), options);
  }

  async dedupe(options: DedupeOptions = {}) {
    await this.run('npx yarn-deduplicate', options);
  }

  getLockFileName() {
    return 'yarn.lock';
  }
}
