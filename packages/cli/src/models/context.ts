import { type PackageManager } from '@tinkoff/package-manager-wrapper';
import { AnalyticsService } from '@tramvai/api/lib/services/analytics';
import type { Logger } from './logger';
import type { Command, CommandResult } from './command';
import type { Task, TaskResult } from './task';
import type { ConfigManager } from './config';

export class Context {
  constructor(
    public config: ConfigManager,
    public logger: Logger,
    public cliRootDir: string,
    public cliPackageManager: PackageManager,
    public packageManager: PackageManager,
    public analytics: AnalyticsService,
    public runTask: (name, params?) => Promise<TaskResult>,
    public runCommand: (name, params?) => Promise<CommandResult>,
    public getTasks: () => Task[],
    public getCommands: () => Command[]
  ) {}
}
