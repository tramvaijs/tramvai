import type {
  InstallOptions,
  PackageManagerOptions,
  RemoveOptions,
  DedupeOptions,
} from './PackageManager';
import { PackageManager } from './PackageManager';

export class PnpmPackageManager extends PackageManager {
  readonly name = 'pnpm';

  constructor(options: PackageManagerOptions) {
    super(options);
  }

  async install(options: InstallOptions = {}) {
    const { version, noSave, devDependency } = options;
    const packagesForInstall = this.getPackagesForInstall(options);
    const isPackagesSpecified = packagesForInstall !== '';

    const commandLineArgs = [
      'pnpm',
      isPackagesSpecified ? 'add' : 'install',
      isPackagesSpecified && packagesForInstall,
      version && '--save-exact',
      noSave && '--frozen-lockfile',
      devDependency && '--save-dev',
      this.registryFlag(options),
    ].filter(Boolean);

    await this.run(commandLineArgs.join(' '), options);
  }

  async remove(options: RemoveOptions) {
    const { name } = options;

    const commandLineArgs = ['pnpm', 'remove', name, this.registryFlag(options)].filter(Boolean);

    await this.run(commandLineArgs.join(' '), options);
  }

  async dedupe(_options: DedupeOptions = {}) {}

  getLockFileName() {
    return 'pnpm-lock.yaml';
  }
}
