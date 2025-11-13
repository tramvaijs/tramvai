import { resolve } from 'path';
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
      noSave && '--frozen-lockfile',
      devDependency && '--dev',
      this.workspaces && !workspace && '--ignore-workspace-root-check',
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

  private getWorkspaceName(path: string) {
    try {
      const packageJson = require(resolve(this.rootDir, path, 'package.json'));
      return packageJson.name as string;
    } catch {
      throw new Error(`No workspace found by path: ${path}`);
    }
  }

  getLockFileName() {
    return 'yarn.lock';
  }

  async getRegistryUrl(): Promise<string> {
    return (await this.run('yarn config get registry', {})).stdout.trim();
  }
}
