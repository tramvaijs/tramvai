import noop from '@tinkoff/utils/function/noop';
import type { EnvParameter } from '@tramvai/tokens-common';
import { EnvironmentManager } from '../shared/EnvironmentManager';

const readFileWithEnv = (path: string) => {
  try {
    const requireFunc =
      // @ts-ignore
      typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;

    return requireFunc(path);
  } catch (e) {
    return {};
  }
};

export class EnvironmentManagerServer extends EnvironmentManager {
  private clientUsedList: Record<string, string> = {};

  constructor(private tokens: EnvParameter[]) {
    super();
    this.processing();
  }

  clientUsed() {
    return this.clientUsedList;
  }

  updateClientUsed(result: Record<string, string>) {
    this.clientUsedList = Object.assign(this.clientUsedList, result);
  }

  // eslint-disable-next-line class-methods-use-this
  private getEnvInFiles() {
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.DANGEROUS_UNSAFE_ENV_FILES !== 'true'
    ) {
      return {};
    }

    const path = require('path');
    return {
      ...readFileWithEnv(path.resolve(process.cwd(), 'server', `env.js`)), // env.js убрать в будущем, как переедет платформа
      ...readFileWithEnv(path.resolve(process.cwd(), `env.development.js`)),
      ...readFileWithEnv(path.resolve(process.cwd(), `env.js`)),
    };
  }

  private getEnvInApp() {
    const appValue: Record<string, string> = {};
    this.tokens.forEach((token) => {
      if (token.value !== undefined) {
        appValue[token.key] = token.value;
      }
    });
    return appValue;
  }

  private collectionEnv(): Record<string, string> {
    return { ...this.getEnvInApp(), ...this.getEnvInFiles(), ...process.env };
  }

  private processing() {
    const result: Record<string, string> = {};
    const envParameters = this.collectionEnv();

    this.tokens.forEach(({ key, validator = noop, optional, dehydrate }) => {
      const value = envParameters[key];

      if (typeof value === 'undefined' && !optional) {
        throw new Error(
          `Env parameter ${key} not found. You need add a this env parameter. If you have questions read the docs`
        );
      }

      // Not calling validation on empty values.
      const validation = typeof value !== 'undefined' && validator(value);
      if (typeof validation === 'string') {
        throw new Error(
          `Env parameter ${key} with value ${value} not valid, message: ${validation}`
        );
      }

      result[key] = value;

      if (dehydrate !== false) {
        this.clientUsedList[key] = value;
      }
    });

    process.env = envParameters; // Записываем в process.env итоговый результат. TODO убрать позже

    this.update(result);
  }
}
