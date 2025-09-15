import { resolve } from 'path';
import type {
  InstallOptions,
  PackageManagerOptions,
  RemoveOptions,
  DedupeOptions,
} from './PackageManager';
import { PackageManager } from './PackageManager';

export class YarnBerryPackageManager extends PackageManager {
  readonly name = 'yarn';

  constructor(options: PackageManagerOptions) {
    super(options);
  }

  async install(options: InstallOptions = {}) {
    const { version, noSave, devDependency, workspace } = options;
    const packagesForInstall = this.getPackagesForInstall(options);
    const isPackagesSpecified = packagesForInstall !== '';

    const commandLineArgs = [
      'yarn',
      // Yarn accepts workspace as only name, not full path
      workspace && `workspace ${this.getWorkspaceName(workspace)}`,
      isPackagesSpecified && 'add',
      isPackagesSpecified && packagesForInstall,
      version && '--exact',
      packagesForInstall === '' && (noSave ? '--immutable' : '--no-immutable'),
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
    await this.run('yarn dedupe', options);
  }

  private getPackageJson(path: string) {
    return require(resolve(this.rootDir, path, 'package.json'));
  }

  private getWorkspaceName(path: string) {
    try {
      const packageJson = this.getPackageJson(path);
      return packageJson.name as string;
    } catch {
      throw new Error(`No workspace found by path: ${path}`);
    }
  }

  getLockFileName() {
    return 'yarn.lock';
  }
}
