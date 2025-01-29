import type { Options } from 'execa';
import { command } from 'execa';
import { WorkspacesParser } from './WorkspacesParser';

export interface PackageManagerOptions {
  rootDir: string;
  registry?: string;
}

export interface InstallOptions extends Options {
  packageNames?: string | string[];
  version?: string;
  registry?: string;
  workspace?: string;
  noSave?: boolean; // works only with npm
  cwd?: string;
  devDependency?: boolean;
}

export interface RemoveOptions extends Options {
  name: string;
  registry?: string;
  cwd?: string;
}

export interface ExistsOptions extends Options {
  name: string;
  cwd?: string;
}

export interface DedupeOptions extends Options {
  cwd?: string;
}

export abstract class PackageManager {
  readonly name: 'npm' | 'yarn' | 'pnpm' | 'unknown' = 'unknown';

  protected rootDir: string;
  protected registry?: string;
  protected worskpacesParser: WorkspacesParser;

  constructor(options: PackageManagerOptions) {
    const { rootDir, registry } = options;

    this.rootDir = rootDir;
    this.registry = registry;
    this.worskpacesParser = new WorkspacesParser({ rootDir });
  }

  abstract install(options?: InstallOptions): Promise<void>;
  abstract remove(options: RemoveOptions): Promise<void>;
  abstract dedupe(options?: DedupeOptions): Promise<void>;
  abstract getLockFileName(): string;

  async exists(options: ExistsOptions): Promise<boolean> {
    const { name } = options;

    try {
      // for tramvai repository and potentially for other monorepos,
      // we can check package availability with Node.js resolve algorithm
      require.resolve(name);

      return true;
    } catch (e) {
      return false;
    }
  }

  protected run(cmd: string, options: Options) {
    return command(cmd, {
      ...options,
      cwd: options.cwd || this.rootDir,
    });
  }

  protected registryFlag(options: { registry?: string }) {
    const registry = options.registry || this.registry;

    return registry && `--registry=${registry}`;
  }

  protected getPackagesForInstall(options: { packageNames?: string | string[]; version?: string }) {
    const { packageNames, version } = options;

    return (Array.isArray(packageNames) ? packageNames : [packageNames])
      .filter(Boolean)
      .map((packageName) => (version ? `${packageName}@${version}` : packageName))
      .join(' ');
  }

  isWorkspaceExists(workspace: string) {
    return this.worskpacesParser.exists(workspace);
  }

  get workspaces() {
    return this.worskpacesParser.workspaces;
  }
}
