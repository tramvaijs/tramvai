import type { RecordProvide } from './Container.h';
import type {
  ScopeVariants,
  Provider,
  ProviderDeps,
  ProviderDep,
  ProvideDepsIterator,
} from './Provider';
import { Scope, Errors } from './constant';
import { createError } from './createError';
import { DI_TOKEN } from './tokens';
import type {
  BaseTokenInterface,
  MultiTokenInterface,
  OptionalTokenDependency,
} from './createToken/createToken';
import { tokenToString } from './createToken/createToken';

/**
 * Маркер, который указывает, что значение еще не создано. Для проверки по ссылке.
 */
export const NOT_YET = '__NOT_YET__MARKER';

/**
 * Маркер, который указывает, что создание значения находится в процессе вызова.
 *
 * И если будет найдено это значение при создании дочерних зависимостей, то значит у нас
 * кольцевая зависимость
 */
const CIRCULAR = '__CIRCULAR__MARKER';

function tokenToKey(token: any): symbol {
  return token.isModernToken ? token.name : Symbol.for(token.toString());
}

/* eslint-disable no-underscore-dangle */
function proxyHydrationError(token: symbol, e: Record<string, unknown>) {
  const name = tokenToString(token);

  if (!e.__extendedWithStack) {
    e.__extendedWithStack = true;
    e.message = `${e.message} at "${name}"`;
  } else {
    e.message += ` < ${name}`;
  }

  if (Object.hasOwnProperty.call(e, 'stack') && typeof e.stack === 'string') {
    e.stack = e.stack.replace(/^.+\n/, `${e.name}: ${e.message}\n`);
  }

  throw e;
}
/* eslint-enable no-underscore-dangle */

function checkIfProviderMatchToken(provider: Provider) {
  if (typeof provider.provide === 'string') {
    return;
  }

  const tokenOptions = provider.provide.options;

  if (!provider.provide.isModernToken && tokenOptions && tokenOptions.multi && !provider.multi) {
    throw createError(`Token ${provider.provide.toString()} require multi providers`, {
      type: Errors.REQUIRE_MULTI,
      stack: (provider as any).__stack,
    });
  }
}

function checkValidateInterfaceProvider(provider: Provider) {
  if (
    !provider ||
    !provider.provide ||
    // @ts-ignore
    (provider.useValue === undefined &&
      // @ts-ignore
      provider.useClass === undefined &&
      // @ts-ignore
      provider.useFactory === undefined)
  ) {
    throw createError(
      `Invalid provider. Check what is passed to the DI. Current value is not a provider: ${JSON.stringify(
        provider,
        (k, v) => {
          return v === undefined ? 'undefined' : v;
        }
      )}`,
      {
        type: Errors.WRONG_FORMAT,
        stack: (provider as any)?.__stack,
      }
    );
  }
}

function checkFound(record: RecordProvide<any> | undefined, token: symbol) {
  if (record === undefined) {
    const name = tokenToString(token);

    throw createError(`Token not found "${name}"`, {
      type: Errors.NOT_FOUND,
    });
  }
}

function checkCircularDeps(record: RecordProvide<any>, token: symbol, value: any) {
  if (value === CIRCULAR) {
    const name = tokenToString(token);

    throw createError(`Circular dep for "${name}"`, {
      type: Errors.CIRCULAR_DEP,
      stack: record.stack,
    });
  }
}

// eslint-disable-next-line max-params
function makeRecord<T>(
  factory: ((deps: ProvideDepsIterator<any>) => T) | undefined,
  resolvedDeps: Record<string, Provider>,
  scope: ScopeVariants,
  multi: boolean,
  stack?: string
): RecordProvide<T> {
  return {
    factory,
    resolvedDeps,
    scope,
    multi: multi ? [] : undefined,
    stack,
  };
}

function providerToRecord<T>(provider: Provider): RecordProvide<T> {
  let factory;
  let resolvedDeps;
  let scope = (provider.provide.isModernToken && provider.provide.options.scope) ?? Scope.REQUEST;

  if ('useFactory' in provider) {
    factory = (deps: ProvideDepsIterator<any>) => provider.useFactory(deps);
    if ('deps' in provider) {
      resolvedDeps = provider.deps;
    }
    if (provider.scope) {
      scope = provider.scope;
    } else if (provider.provide.isModernToken && provider.provide.options.scope) {
      scope = provider.provide.options.scope;
    }
  } else if ('useClass' in provider) {
    // eslint-disable-next-line new-cap
    factory = (deps: ProvideDepsIterator<any>) => new provider.useClass(deps);
    if ('deps' in provider) {
      resolvedDeps = provider.deps;
    }
    if (provider.scope) {
      scope = provider.scope;
    } else if (provider.provide.isModernToken && provider.provide.options.scope) {
      scope = provider.provide.options.scope;
    }
  }
  return makeRecord<T>(factory, resolvedDeps, scope, false, (provider as any).__stack);
}

function providerToValue<T>(provider: Provider): T | typeof NOT_YET {
  if ('useValue' in provider) {
    return provider.useValue;
  }

  return NOT_YET;
}

export class Container {
  /**
   * Список c записями инстансов провайдеров
   */
  protected records = new Map<symbol, RecordProvide<any>>();

  protected recordValues = new Map<RecordProvide<any>, any>();
  private readonly fallback?: Container;

  constructor(additionalProviders?: Provider[], fallback?: Container) {
    if (additionalProviders) {
      additionalProviders.forEach((provider) => this.register(provider));
    }

    this.fallback = fallback;

    this.register({ provide: DI_TOKEN, useValue: this });
  }

  get<T>(obj: { token: BaseTokenInterface<T>; optional: true; multi?: false }): T | null;
  get<T>(obj: { token: BaseTokenInterface<T>; optional?: false; multi?: false }): T;

  get<T>(obj: { token: MultiTokenInterface<T>; optional: true; multi?: true }): T[] | null;
  get<T>(obj: { token: MultiTokenInterface<T>; optional?: false; multi?: true }): T[];

  get<T>(token: BaseTokenInterface<T>): T;
  get<T>(token: MultiTokenInterface<T>): T[];

  get<T>(obj: OptionalTokenDependency<T>): T | null;

  get<T>(token: T): T;

  get<T extends ProviderDep>(tokenORObject: T) {
    let token;
    let optional = false;
    let multi = false;

    if (typeof tokenORObject === 'string') {
      token = tokenORObject;
    } else if ('token' in (tokenORObject as any)) {
      token = (tokenORObject as any).token;
      optional = (tokenORObject as any).optional;
      multi = token.options?.multi || false;
    } else {
      token = tokenORObject;
    }

    token = tokenToKey(token);
    const record = this.getRecord(token);

    if (!record && this.fallback?.getRecord(token)) {
      return this.fallback.get(tokenORObject);
    }

    if (!record && optional) {
      // return empty array for optional multi token
      if (multi) {
        return [];
      }
      // for legacy string tokens we cannot know if the token is multi or not
      return null;
    }

    checkFound(record, token);

    return this.hydrate(record as RecordProvide<T>, token, optional) as T;
  }

  getOfDeps<T extends ProviderDeps>(deps: T): ProvideDepsIterator<T> {
    const result = {} as any;

    for (const key in deps) {
      if (Object.prototype.hasOwnProperty.call(deps, key)) {
        result[key] = this.get(deps[key]);
      }
    }

    return result;
  }

  getRecord<T>(token: symbol) {
    const record: RecordProvide<T> | undefined = this.records.get(token);

    return record;
  }

  has(token: any) {
    return !!this.getRecord(tokenToKey(token));
  }

  borrowToken(from: Container, token: any) {
    const tokenKey = tokenToKey(token);

    if (!this.getRecord(tokenKey)) {
      const record = from.getRecord(tokenKey);

      if (record) {
        this.records.set(tokenKey, record);
        this.recordValues.set(record, NOT_YET);
      }
    }
  }

  getValue<T>(record: RecordProvide<T>): T | typeof NOT_YET {
    return this.recordValues.get(record);
  }

  register<Deps, P = any>(provider: Provider<Deps, P>) {
    if (process.env.NODE_ENV !== 'production') {
      checkValidateInterfaceProvider(provider);
    }
    checkIfProviderMatchToken(provider);

    return this.processProvider(provider);
  }

  /**
   * Обработка различных видов провайдеров
   */
  processProvider(provider: Provider): void {
    const token = tokenToKey(provider.provide);
    const record = providerToRecord(provider);
    const value = providerToValue(provider);

    if ((provider.provide.isModernToken && provider.provide.options?.multi) || provider.multi) {
      // Сначала идем за multiRecord, так как он может быть уже создан
      let multiRecord = this.getRecord(token) as RecordProvide<unknown>;

      if (multiRecord) {
        // Смешанный провайдер
        if (multiRecord.multi === undefined) {
          throw createError(`Mixed multi-provider for ${tokenToString(token)}`, {
            type: Errors.MIXED_MULTI,
            stack: (provider as any).__stack,
          });
        }
      } else {
        multiRecord = makeRecord(
          undefined,
          {},
          provider.scope ||
            (provider.provide.isModernToken && provider.provide.options.scope) ||
            Scope.REQUEST,
          true,
          (provider as any).__stack
        );
        this.records.set(token, multiRecord);
        this.recordValues.set(multiRecord, NOT_YET);
      }

      (multiRecord.multi as any[]).push(record);
    } else {
      this.records.set(token, record);
    }

    this.recordValues.set(record, value);
  }

  protected hydrateDeps<T>(record: RecordProvide<T>) {
    return this.getOfDeps(record.resolvedDeps);
  }

  protected hydrate<T>(record: RecordProvide<T>, token: symbol, optional: boolean): T | null {
    let value: any = this.getValue(record);

    checkCircularDeps(record, token, value);

    if (value !== NOT_YET) {
      return value;
    }

    if (record.multi) {
      this.recordValues.set(record, CIRCULAR);
      // мульти провайдеры не могут быть optional
      value = record.multi.map((rec) => this.hydrate(rec, token, false));
    } else {
      /* Устаналиваем изначально value к CIRCULAR, для последующего нахождения цикла при резолве депенденси */
      this.recordValues.set(record, CIRCULAR);

      try {
        value = (record.factory as (deps: ProvideDepsIterator<any>) => T)(this.hydrateDeps(record));
      } catch (e: any) {
        this.recordValues.set(record, NOT_YET);

        if (optional && e.type === Errors.NOT_FOUND) {
          return null;
        }
        // Заполняем ошибку списком токенов модулей, которые находятся в цепочке инициализации.
        // Вызовы тут рекурсивные поэтому на каждом уровне try/catch будем дописывать обрабатываемый токен.
        proxyHydrationError(
          token,
          Object.assign(e, {
            stack:
              !record.stack || /---- caused by: ----/g.test(e.stack)
                ? e.stack
                : `${e.stack}\n---- caused by: ----\n${record.stack || ''}`,
          })
        );
      }
    }

    this.recordValues.set(record, value);

    return value as T;
  }
}
