import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { Worker } from 'node:worker_threads';
import { PackageManager } from '@tinkoff/package-manager-wrapper';
import { Logger } from './logger';
import { createMemoryMonitor } from '../utils/memoryUsage';
import { enumerateErrorProperties } from '../utils/errors';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var __TRAMVAI_EXIT_HANDLERS__: Array<() => Promise<any>>;
}

export type LEVEL = 'INFO' | 'WARN' | 'ERROR';

export type COMMANDS =
  | 'start'
  | 'build'
  | 'start-prod'
  | 'static'
  | 'analyze'
  | 'new'
  | 'add'
  | 'update';

export type Event = {
  /**
   * @description ISO-8601 + timezone
   */
  timestamp: string;
  /**
   * @description Unique identifier for the current cli execution
   */
  'x-command-id': string;
  level: LEVEL;
  event: string;
  message: string;
  system: string;
  tramvai: TramvaiProperties;
  os: SystemProperties;
  // process.env.CI
  vcs?: VcsProperties;
};

export type ProjectProperties = {
  name: string;
  type?: 'application' | 'child-app' | 'module' | 'package' | 'unknown';
};

export type TramvaiProperties = {
  name: '@tramvai/cli';
  version: string;
};

export type DependenciesProperties = {
  react?: string;
  webpack?: string;
  babel?: string;
  swc?: string;
};

export type SystemProperties = {
  nodeVersion: string;
  packageManager: {
    name: string;
  };
  platform: string;
  arch: string;
  cpus: {
    model: string;
    count: number;
  };
};

export type TranspilationType = 'custom' | 'all' | 'none' | 'only-modern';

export type FeaturesProperties = {
  swc?: boolean;
  fileSystemRouting?: boolean;
  lightningCss?: boolean;
  selectiveTranspilation?: TranspilationType;
  reactCompiler?: boolean;
  devTools?: boolean;
  moduleImage?: boolean;
  modulePwa?: boolean;
  viewTransitions?: boolean;
  transitionsRouterProvider?: boolean;
  experimentalWebpackWorkerThreads?: boolean;
};

export type VcsProperties = {
  // process.env.CI_PROJECT_NAMESPACE
  tenant?: string;
  // process.env.CI_PROJECT_NAME
  repository?: string;
  // process.env.CI_PIPELINE_URL
  pipelineUrl?: string;
  // process.env.CI_JOB_URL
  jobUrl?: string;
};

export type MemoryUsageProperties = {
  // in bytes
  maxHeapTotal: number;
  // in bytes
  maxHeapUsed: number;
  // in bytes
  maxRss: number;
};

export type AnalyticsEvents = {
  'cli:init': {
    event: 'cli:init';
    level: 'INFO';
    message: string;
    arguments: string[];
    /**
     * @description CLI uptime in milliseconds before the AnalyticsService was initialized
     */
    uptime: number;
    // TODO: max used old space size flag
    // TODO: detect cold start?
    dependencies: DependenciesProperties;
  };
  'cli:error': {
    event: 'cli:error';
    level: 'ERROR';
    message: string;
    arguments: string[];
    error: Error;
    /**
     * @description CLI uptime in milliseconds before the AnalyticsService was initialized
     */
    uptime: number;
  };
  'cli:command:start': {
    event: 'cli:command:start';
    level: 'INFO';
    message: string;
    command: COMMANDS;
    parameters: Record<string, any>;
    project?: ProjectProperties;
    features?: FeaturesProperties;
  };
  'cli:command:end': {
    event: 'cli:command:end';
    level: 'INFO';
    message: string;
    command: COMMANDS;
    /**
     * @description duration in milliseconds
     */
    duration: number;
    memoryUsage?: MemoryUsageProperties;
    parameters: Record<string, any>;
    project: ProjectProperties;
  };
  'cli:command:build:stats': {
    event: 'cli:command:build:stats';
    level: 'INFO';
    message: string;
    command: 'build';
    // TODO: compilation and stats info
    parameters: Record<string, any>;
    project: ProjectProperties;
  };
  'cli:command:error': {
    event: 'cli:command:error';
    level: 'ERROR';
    message: string;
    command: COMMANDS;
    /**
     * @description duration in milliseconds
     */
    duration: number;
    memoryUsage?: MemoryUsageProperties;
    error: Error;
    parameters: Record<string, any>;
    project?: ProjectProperties;
  };
};

export class AnalyticsService {
  #enabled: boolean;
  #endpoint: string;
  #system: string;
  #debug: boolean;
  #dryRun: boolean;
  #logger: Logger;
  #packageManager: PackageManager;
  #xCommandId: string;
  #worker: Worker | null = null;

  memoryMonitor: ReturnType<typeof createMemoryMonitor> | null = null;

  constructor({
    enabled = true,
    endpoint = '',
    system,
    logger,
    packageManager,
  }: {
    enabled?: boolean;
    endpoint?: string;
    system?: string;
    logger: Logger;
    packageManager: PackageManager;
  }) {
    this.#enabled = process.env.TRAMVAI_ANALYTICS_DISABLED
      ? process.env.TRAMVAI_ANALYTICS_DISABLED !== 'true'
      : enabled;
    this.#endpoint = process.env.TRAMVAI_ANALYTICS_ENDPOINT ?? endpoint;
    this.#system = process.env.TRAMVAI_ANALYTICS_SYSTEM ?? system ?? 'tramvai-cli';
    this.#debug = process.env.TRAMVAI_ANALYTICS_DEBUG === 'true';
    this.#dryRun = process.env.TRAMVAI_ANALYTICS_DRY_RUN === 'true';
    this.#logger = logger;
    this.#packageManager = packageManager;
    this.#xCommandId = crypto.randomUUID();
  }

  async init() {
    if (!this.#worker && this.#enabled && this.#endpoint) {
      await this.#spawnWorker();
    }

    if (!this.memoryMonitor) {
      this.#initMemoryMonitor();
    }

    this.#initErrorHandlers();
  }

  #initMemoryMonitor() {
    this.memoryMonitor = createMemoryMonitor({ sampleInterval: 250 });
    this.memoryMonitor.start();

    // CLI will wait for this handlers before exiting
    // @reference `packages/cli/src/cli/runCLI.ts`
    if (!global.__TRAMVAI_EXIT_HANDLERS__) {
      global.__TRAMVAI_EXIT_HANDLERS__ = [];
    }

    global.__TRAMVAI_EXIT_HANDLERS__.push(async () => {
      this.memoryMonitor?.stop();
    });
  }

  #initErrorHandlers() {
    const sendErrorEvent = async (message: string, error: Error) => {
      await this?.send({
        event: 'cli:error',
        message,
        level: 'ERROR',
        arguments: process.argv.slice(2),
        error,
        uptime: performance.now(),
      });
    };

    process.on('uncaughtException', (error) => {
      sendErrorEvent('uncaughtException', error);
    });

    process.on('unhandledRejection', (error) => {
      sendErrorEvent('unhandledRejection', error as Error);
    });
  }

  async send<E extends keyof AnalyticsEvents>(event: AnalyticsEvents[E]): Promise<void> {
    return this.sendRawEvent(event);
  }

  async sendRawEvent(
    rawEvent: Pick<Event, 'event' | 'message' | 'level'> & Record<string, any>
  ): Promise<void> {
    if (!this.#enabled || !this.#endpoint) {
      return;
    }

    try {
      const event: Event & Record<string, any> = {
        ...rawEvent,
        timestamp: new Date().toISOString(),
        'x-command-id': this.#xCommandId,
        system: this.#system,
        tramvai: getTramvaiProperties(),
        os: getOsProperties({ packageManager: this.#packageManager }),
      };

      if (process.env.CI) {
        event.vcs = getVcsProperties();
      }

      if ('error' in event && event.error instanceof Error) {
        enumerateErrorProperties(event.error);
      }

      if (!this.#worker) {
        await this.#spawnWorker();
      }

      this.#worker?.postMessage({
        event: 'SEND_EVENT',
        payload: event,
      });
    } catch (error) {
      this.#logger.event({
        type: 'error',
        event: 'analytics',
        message: `Error sending analytics data: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  async #spawnWorker() {
    this.#worker = new Worker(path.resolve(__dirname, './analytics.worker.js'), {
      workerData: {
        endpoint: this.#endpoint,
        debug: this.#debug,
        dryRun: this.#dryRun,
      },
      name: 'analytics-worker',
    });

    this.#worker.on('error', (err) => {
      this.#logger.event({
        type: `error`,
        event: 'analytics',
        message: `Worker error: ${err instanceof Error ? err.message : String(err)}`,
      });
    });

    this.#worker.on('exit', (code) => {
      if (code !== 0) {
        this.#logger.event({
          type: `error`,
          event: 'analytics',
          message: `Worker exit with code: ${code}`,
        });
      }
    });

    // CLI will wait for this handlers before exiting
    // @reference `packages/cli/src/cli/runCLI.ts`
    if (!global.__TRAMVAI_EXIT_HANDLERS__) {
      global.__TRAMVAI_EXIT_HANDLERS__ = [];
    }

    // We need to ensure that the analytics is sent before the process exits.
    // To ensure that, we implement a graceful worker shutdown:
    // - send `EXIT` message to the worker
    // - wait for the worker to respond with `SHUTDOWN_COMPLETE` message
    // - worker will wait for all pending requests, send `SHUTDOWN_COMPLETE` to the parent and exit
    global.__TRAMVAI_EXIT_HANDLERS__.push(async () => {
      this.#logger.event({
        type: 'info',
        event: 'analytics',
        message: 'Process shutting down, waiting for pending analytics to be sent',
      });

      const promise = new Promise<void>((resolve) => {
        this.#worker?.on('message', async (message) => {
          if (message.event === 'SHUTDOWN_COMPLETE') {
            this.#worker = null;
            resolve();
          }
        });
      });

      this.#worker?.postMessage({
        event: 'EXIT',
      });

      await Promise.race([promise, new Promise<void>((resolve) => setTimeout(resolve, 5000))]);
    });

    await new Promise((resolve) => {
      this.#worker?.once('online', resolve);
    });
  }
}

const cache: {
  tramvaiProperties?: TramvaiProperties;
  osProperties?: SystemProperties;
  vcsProperties?: VcsProperties;
  dependenciesProperties?: DependenciesProperties;
} = {};

function getTramvaiProperties(): TramvaiProperties {
  if (cache.tramvaiProperties) {
    return cache.tramvaiProperties;
  }

  const packageJson = require(path.resolve(__dirname, '../../package.json'));

  const tramvaiProperties: TramvaiProperties = {
    name: '@tramvai/cli',
    version: packageJson.version,
  };

  cache.tramvaiProperties = tramvaiProperties;

  return tramvaiProperties;
}

function getOsProperties({ packageManager }: { packageManager: PackageManager }): SystemProperties {
  if (cache.osProperties) {
    return cache.osProperties;
  }

  const osProperties = {
    nodeVersion: process.version,
    packageManager: {
      name: packageManager.name,
    },
    platform: os.platform(),
    arch: os.arch(),
    cpus: {
      model: os.cpus()[0].model,
      count: os.cpus().length,
    },
  };

  cache.osProperties = osProperties;

  return osProperties;
}

function getVcsProperties(): VcsProperties {
  if (cache.vcsProperties) {
    return cache.vcsProperties;
  }

  const vcsProperties: VcsProperties = {};

  if (process.env.CI_PROJECT_NAMESPACE) {
    vcsProperties.tenant = process.env.CI_PROJECT_NAMESPACE;
  }
  if (process.env.CI_PROJECT_NAME) {
    vcsProperties.repository = process.env.CI_PROJECT_NAME;
  }
  if (process.env.CI_PIPELINE_URL) {
    vcsProperties.pipelineUrl = process.env.CI_PIPELINE_URL;
  }
  if (process.env.CI_JOB_URL) {
    vcsProperties.jobUrl = process.env.CI_JOB_URL;
  }

  cache.vcsProperties = vcsProperties;

  return vcsProperties;
}

export function resolveDependenciesProperties(): DependenciesProperties {
  if (cache.dependenciesProperties) {
    return cache.dependenciesProperties;
  }

  const dependencies: DependenciesProperties = {};

  try {
    dependencies.react = require('react/package.json').version;
  } catch (e) {
    // do nothing
  }

  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    dependencies.webpack = require('webpack/package.json').version;
  } catch (e) {
    // do nothing
  }

  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    dependencies.babel = require('@babel/core/package.json').version;
  } catch (e) {
    // do nothing
  }

  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    dependencies.swc = require('@swc/core/package.json').version;
  } catch (e) {
    // do nothing
  }

  cache.dependenciesProperties = dependencies;

  return dependencies;
}
