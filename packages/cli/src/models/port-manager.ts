import { access, outputFile, appendFile, readFile } from 'fs-extra';
import { join } from 'path';
import findCacheDir from 'find-cache-dir';
import detectPort from 'detect-port';
import { lock } from 'proper-lockfile';
import noop from '@tinkoff/utils/function/noop';

import type { ConfigEntry } from '../typings/configEntry/common';
import type { Params as StartParams } from '../api/start';
import type { Params as StartProdParams } from '../api/start-prod';
import type { Logger } from './logger';

interface NetworkConstructorPayload {
  configEntry: ConfigEntry;
  commandParams: StartParams | StartProdParams;
  logger: Logger;
}

export class PortManager {
  static readonly DEFAULT_PORT = 3000;
  static readonly DEFAULT_STATIC_PORT = 4000;
  // Child Apps and modules use only static port
  static readonly DEFAULT_MODULE_STATIC_PORT = 4040;
  private static readonly cachePath = join(
    findCacheDir({ cwd: __dirname, create: true, name: 'tramvai' }),
    'used-ports'
  );

  private readonly configEntry: ConfigEntry;
  private readonly commandParams: StartParams | StartProdParams;
  private readonly logger: Logger;

  public port: number | null = null;
  public staticPort: number | null = null;

  constructor({ configEntry, commandParams, logger }: NetworkConstructorPayload) {
    this.configEntry = configEntry;
    this.commandParams = commandParams;
    this.logger = logger;
  }

  private async handleConfigValues() {
    if (this.commandParams.port !== undefined && this.commandParams.port !== 0) {
      // @ts-expect-error There is a string actually
      this.port = parseInt(this.commandParams.port, 10);
    }

    if (this.commandParams.staticPort !== undefined && this.commandParams.staticPort !== 0) {
      // @ts-expect-error There is a string actually
      this.staticPort = parseInt(this.commandParams.staticPort, 10);
    }

    switch (this.configEntry.type) {
      case 'child-app':
        await this.forChildApp();
        break;

      case 'module':
        await this.forModule();
        break;

      case 'application':
        await this.forApplication();
        break;

      default:
        break;
    }
  }

  /**
   * Try to detect port considering the fact, that if user requests
   * a port explicitly, we should not try to detect a free one.
   *
   * Also, handle zero port (it means any random port) as the edge case,
   * because we must pass a final number to the config manager.
   */
  public async computeAvailablePorts() {
    if (process.env.USE_CONCURRENT_PORT_DETECTING === 'true') {
      await this.createCacheFile();
      const release = await this.lockCacheFile();

      try {
        await this.handleConfigValues();

        await this.appendCacheFile([this.port, this.staticPort].join(','));
      } catch (error) {
        this.logger.event({
          type: 'warning',
          event: 'PORT_MANAGER:GET_AVAILABLE_PORTS',
          message: `Can't get free ports for ${this.configEntry.type}:`,
          payload: error.message ?? '',
        });
      } finally {
        await release();
      }

      return;
    }

    await this.handleConfigValues();
  }

  /**
   * Cleanup a cache file by removing ports were written previously.
   */
  public async cleanup() {
    if (process.env.USE_CONCURRENT_PORT_DETECTING === 'true') {
      const release = await this.lockCacheFile();

      try {
        const cache = await this.readCacheFile();

        await this.writeCacheFile(
          cache
            .filter(Boolean)
            .filter((port) => port !== this.port.toString() && port !== this.staticPort.toString())
            .join(',')
        );
      } catch (error) {
        this.logger.event({
          type: 'warning',
          event: 'PORT_MANAGER:CLEANUP',
          message: "Can't perform a cleanup of previously used ports:",
          payload: error.message ?? '',
        });
      } finally {
        await release();
      }

      return;
    }

    noop();
  }

  private async forApplication() {
    this.port = this.port ?? (await this.resolveFreePort(PortManager.DEFAULT_PORT));
    this.staticPort =
      this.staticPort ?? (await this.resolveFreePort(PortManager.DEFAULT_STATIC_PORT));
  }

  private async forModule() {
    this.port = this.port ?? (await this.resolveFreePort(PortManager.DEFAULT_MODULE_STATIC_PORT));
    this.staticPort =
      this.staticPort ?? (await this.resolveFreePort(PortManager.DEFAULT_MODULE_STATIC_PORT));
  }

  private async forChildApp() {
    this.port = this.port ?? (await this.resolveFreePort(PortManager.DEFAULT_MODULE_STATIC_PORT));
    this.staticPort =
      this.staticPort ?? (await this.resolveFreePort(PortManager.DEFAULT_MODULE_STATIC_PORT));
  }

  private lockCacheFile() {
    return lock(PortManager.cachePath, { retries: 10 });
  }

  private async createCacheFile() {
    try {
      await access(PortManager.cachePath);
    } catch (error) {
      await outputFile(PortManager.cachePath, '');
    }
  }

  private async readCacheFile() {
    try {
      const content = await readFile(PortManager.cachePath, { encoding: 'utf-8' });

      return content.split(',');
    } catch (error) {
      return [];
    }
  }

  private async writeCacheFile(content: string) {
    await outputFile(PortManager.cachePath, content);
  }

  private async appendCacheFile(content: string) {
    await appendFile(PortManager.cachePath, `,${content}`);
  }

  private async resolveFreePort(initial: number) {
    try {
      if (process.env.USE_CONCURRENT_PORT_DETECTING === 'true') {
        const cache = await this.readCacheFile();
        let port = await detectPort(initial);
        let attempts = 1;

        while (cache.includes(port.toString())) {
          if (attempts >= 3) {
            throw new Error(`Max attempts exceeded (${attempts})`);
          }

          port = await detectPort(0);

          attempts++;
        }

        return port;
      }

      return detectPort(initial);
    } catch (error) {
      this.logger.event({
        type: 'info',
        event: 'PORT_MANAGER:RESOLVE_FREE_PORT',
        message: "Can't resolve a free port, fallback to an initial one:",
        payload: error.message ?? '',
      });

      return initial;
    }
  }
}
