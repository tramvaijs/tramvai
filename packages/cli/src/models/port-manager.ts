import detectPort from 'detect-port';

import type { ConfigEntry } from '../typings/configEntry/common';
import type { Params as StartParams } from '../api/start';
import type { Params as StartProdParams } from '../api/start-prod';

interface NetworkConstructorPayload {
  configEntry: ConfigEntry;
  commandParams: StartParams | StartProdParams;
}

export class PortManager {
  static DEFAULT_PORT = 3000;
  static DEFAULT_MODULE_PORT = 4040;
  static DEFAULT_STATIC_PORT = 4000;
  static DEFAULT_MODULE_STATIC_PORT = 4040;

  private configEntry: ConfigEntry;
  private commandParams: StartParams | StartProdParams;

  public port: number | null = null;
  public staticPort: number | null = null;

  constructor({ configEntry, commandParams }: NetworkConstructorPayload) {
    this.configEntry = configEntry;
    this.commandParams = commandParams;
  }

  /**
   * Try to detect port considering the fact, that if user requests
   * a port explicitly, we should not try to detect a free one.
   *
   * Also, handle zero port (it means any random port) as the edge case,
   * because we must pass a final number to the config manager.
   */
  public async computeAvailablePorts(): Promise<void> {
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

  private async forApplication(): Promise<void> {
    this.port = this.port ?? (await detectPort(PortManager.DEFAULT_PORT));
    this.staticPort = this.staticPort ?? (await detectPort(PortManager.DEFAULT_STATIC_PORT));
  }

  private async forModule(): Promise<void> {
    this.port = this.port ?? (await detectPort(PortManager.DEFAULT_MODULE_PORT));
    this.staticPort = this.staticPort ?? (await detectPort(PortManager.DEFAULT_MODULE_STATIC_PORT));
  }

  private async forChildApp(): Promise<void> {
    this.port = this.port ?? (await detectPort(PortManager.DEFAULT_MODULE_PORT));
    this.staticPort = this.staticPort ?? (await detectPort(PortManager.DEFAULT_MODULE_STATIC_PORT));
  }
}
