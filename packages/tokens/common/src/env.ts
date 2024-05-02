import { Scope, createToken } from '@tinkoff/dippy';

export interface EnvironmentManager {
  get(name: string): string | undefined;
  getInt(name: string, def: number): number;
  getAll(): Record<string, string>;
  update(result: Record<string, string>): void;
  /**
   * @deprecated use CLIENT_ENV_MANAGER_TOKEN
   */
  clientUsed(): Record<string, string>;
  /**
   * @deprecated use CLIENT_ENV_MANAGER_TOKEN
   */
  updateClientUsed(result: Record<string, string>): void;
}

export interface ClientEnvironmentRepository {
  get(name: string): string | undefined;
  set(name: string, value: string): void;
  getAll(): Record<string, string>;
  update(result: Record<string, string>): void;
}

/**
 * @description
 * Instance that used for managing environment variables
 */
export const ENV_MANAGER_TOKEN = createToken<EnvironmentManager>('environmentManager', {
  scope: Scope.SINGLETON,
});

/**
 * @description
 * Instance that used for store and manage environment variables map, which are passed to the client.
 * Use only server-side for client env values modification depending on the specific request conditions.
 */
export const CLIENT_ENV_REPOSITORY_TOKEN = createToken<ClientEnvironmentRepository>(
  'clientEnvironmentManager',
  {
    scope: Scope.REQUEST,
  }
);

/**
 * @description
 * List of envs that are used by the module or the app.
 * All of the envs specified by that token will be accessible in the code through `environmentManager`
 * ENV_USED_TOKEN format:
    - `key` - id of the env. At that id the value of the env will be accessible through `environmentManager` and will be loaded from the external sources.
    - `value` - default low-priority value for env `key`
    - `optional` - is current env is optional. If `true` the app can work as usual event if the env value were not provided, if `false` - the app will fail to run without env value
    - `validator` - validation function for passed env value. In case this function returns string it will be used as error message and validation will fail
    - `dehydrate` - if `false` then env value will not be passed to client and this env can be used only on server
 *
 * @example
  ```tsx
  interface EnvParameter {
    key: string;
    value?: string;
    optional?: boolean;
    validator?: (value: string) => boolean | string;
    dehydrate?: boolean;
  }
  ```
 */
export interface EnvParameter {
  key: string;
  value?: string;
  optional?: boolean;
  validator?: (value: string) => boolean | string;
  dehydrate?: boolean;
}

export const ENV_USED_TOKEN = createToken<EnvParameter[]>('envUsed', { multi: true });
