import type {
  InstallOptions,
  PackageManagerOptions,
  RemoveOptions,
  DedupeOptions,
} from './PackageManager';
import { PackageManager } from './PackageManager';

export class NpmPackageManager extends PackageManager {
  readonly name = 'npm';

  constructor(options: PackageManagerOptions) {
    super(options);
  }

  async install(options: InstallOptions = {}) {
    const { version, noSave, devDependency, workspace } = options;
    const packagesForInstall = this.getPackagesForInstall(options);
    const isPackagesSpecified = packagesForInstall !== '';

    const commandLineArgs = [
      'npm',
      'install',
      isPackagesSpecified && packagesForInstall,
      version && '--save-exact',
      '--legacy-peer-deps',
      noSave && '--no-save',
      devDependency && '--save-dev',
      workspace && `-w ${workspace}`,
      // use already existing package version if it satisfies semver,
      // instead of adding latest version during install
      '--prefer-dedupe',
      this.registryFlag(options),
    ].filter(Boolean);

    await this.run(commandLineArgs.join(' '), options);
  }

  async remove(options: RemoveOptions) {
    const { name } = options;

    const commandLineArgs = ['npm', 'uninstall', name, this.registryFlag(options)].filter(Boolean);

    await this.run(commandLineArgs.join(' '), options);
  }

  async dedupe(options: DedupeOptions = {}) {
    await this.run('npm dedupe --legacy-peer-deps', options);
  }

  getLockFileName() {
    return 'package-lock.json';
  }
}
