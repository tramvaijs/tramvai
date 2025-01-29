import isNil from '@tinkoff/utils/is/nil';
import { globSync } from 'fast-glob';
import { resolve } from 'path';

export type WorkspacesParserOptions = {
  rootDir: string;
};

export class WorkspacesParser {
  protected rootDir: string;

  constructor({ rootDir }: WorkspacesParserOptions) {
    this.rootDir = rootDir;
  }

  get packageJson() {
    return require(resolve(this.rootDir, 'package.json'));
  }

  get hasWorkspaces() {
    return !isNil(this.packageJson.workspaces);
  }

  get workspaces() {
    if (!this.hasWorkspaces) return null;

    return globSync(this.packageJson.workspaces, { onlyFiles: false, onlyDirectories: true });
  }

  exists(name: string) {
    return this.hasWorkspaces && this.workspaces!.includes(name);
  }
}
