---
id: provider
title: Provider
sidebar_position: 3
---

provider is a simple object that provides an implementation for an interface (identifier) ​​for a particular dependency. An implementation can be a constant value (string, function, symbol, class instance), factory, or class. A factory or class is initialized upon request to the corresponding identifier. It is possible to register several providers for one token, if the `multi` parameter is present.

## Format

```tsx
type Provider = {
  provide: Token; // provider id
  useValue?: any; // implementation of the identifier
  useFactory?: () => any; // implementation of the identifier
  useClass?: Class; // implementation of the identifier
  deps?: Record<string, Token>; // list of dependencies that the provider needs to work
  scope?: 'request' | 'singleton'; // If a singleton, then the container will register one instance of the provider for all client requests. If request will create its own instance for each client and Request
};
```

## Types of providers

### Factory

When the instance is initialized, the function passed to `useFactory` will be called, if `deps` were specified, then the function will be called with the object of implementations as the first argument.

`ExtractDependencyType` helper is used to get the resolved type of the dependency. Inside `useFactory`, `deps` will already has correct types.

```tsx
import { provide, ExtractDependencyType } from '@tramvai/core';

class Implement {
  constructor({ logger }: { logger: ExtractDependencyType<typeof LOGGER> }) {}
}

const provider = provide({
  provide: TOKEN,
  useFactory: (deps) => new Implement(deps),
  deps: {
    logger: LOGGER,
  },
});
```

### Class

When the instance is initialized, the class passed to `useClass` will be created, if `deps` were specified, then the class will be called with the object of implementations as the first argument

```tsx
import { provide, ExtractDependencyType } from '@tramvai/core';

class Implement {
  constructor({ logger }: { logger: ExtractDependencyType<typeof LOGGER> }) {}
}

const provider = provide({
  provide: TOKEN,
  useClass: Implement,
  deps: {
    logger: LOGGER,
  },
});
```

### Value

Sets the provider's value to the data that was passed in the `useValue` parameter, no additional initialization will be performed and `deps` cannot be used

```tsx
import { provide } from '@tramvai/core';

const provider = provide({
  provide: TOKEN,
  useValue: { appName: 'APP' },
});
```

## Multi providers

We may need to be able to register multiple implementations for a single token. For example, several actions for one step. To implement this, you need to pass the `multi` parameter to the token options. In this case, an array of providers is stored in the di container:

```tsx
import { provide, createToken } from '@tramvai/core';

const MULTI_TOKEN = createToken<{ route: string }>('multi token', { multi: true });

const providers = [
  provide({
    provide: MULTI_TOKEN,
    useValue: { route: '/' },
  }),
  provide({
    provide: MULTI_TOKEN,
    useValue: { route: '/cards' },
  }),
];
```

## Dependencies (deps)

Needed to specify the dependencies that are needed for the provider to work. When creating a provider, dependency instances will be created, which are specified in deps and passed to the provider as the first argument. The keys of the deps object will be the implementations that will be sent to the provider. In this case, if the provider is not found in the global DI, an error will be thrown notifying that the current token was not found.

### Format

```tsx
type Provider = {
  deps: {
    [key: string]:
      | Token
      | {
          token: Token;
          optional?: boolean;
          multi?: boolean;
        };
  };
};
```

### Optional Dependencies

We don't always need mandatory dependencies to work. And we want to point out that the dependency is not necessary to work and it is not necessary to throw an error. To do this, you can use `optional` helper (add the `optional` parameter underhood), which will disable throwing an error if there is no dependency. Instead of implementing the dependency, the provider will receive the value `null`.

```tsx
import { provide, optional, ExtractDependencyType } from '@tramvai/core';

class Implement {
  constructor({ logger }: { logger: ExtractDependencyType<typeof LOGGER> | null }) {}
}

const provider = provide({
  provide: TOKEN,
  useClass: Implement,
  deps: {
    logger: optional(LOGGER),
  },
});
```

### Multi dependencies

Some providers are multi-providers and instead of one implementation, we will receive an array of implementations. Type inference for `deps` inside `provide` helper will be done automatically, for provider implementation use `ExtractDependencyType` helper.

```tsx
import { provide, createToken, ExtractDependencyType } from '@tramvai/core';

const COMMANDS_TOKEN = createToken<Command>('commands', { multi: true });

class Implement {
  // commands: Command[]
  constructor({ commands }: { commands: ExtractDependencyType<typeof COMMANDS_TOKEN> }) {
    commands.forEach();
  }
}

const provider = provide({
  provide: TOKEN,
  useClass: Implement,
  deps: {
    commands: COMMANDS_TOKEN,
  },
});
```

### Multi optional dependencies

For `multi` and `optional` dependencies, if provider was not founded, empty `[]` will be resolved, as opposed to `null` for standard tokens.

```tsx
import { provide, optional, createToken, ExtractDependencyType } from '@tramvai/core';

const COMMANDS_TOKEN = createToken<Command>('commands', { multi: true });

class Implement {
  // commands: Command[]
  constructor({ commands }: { commands: ExtractDependencyType<typeof COMMANDS_TOKEN> }) {
    commands.forEach();
  }
}

const provider = provide({
  provide: TOKEN,
  useClass: Implement,
  deps: {
    commands: optional(COMMANDS_TOKEN),
  },
});
```

### Circular dependency

DI does not allow declaring dependencies that depend on each other, for example:

```tsx
import { provide } from '@tramvai/core';

const providers = [
  provide({
    provide: A,
    deps: {
      B: B,
    },
  }),
  provide({
    provide: B,
    deps: {
      A: A,
    },
  }),
];
```

In this example, we will not be able to correctly create provider instances and the code will throw an error.

Such providers should reconsider and make a common part in a separate class, and provider and used in conjunction `A` and `B`

## Scope

> Scope only affects providers at server-side, where child DI containers are created for each request.
> In the browser, you can consider that all providers have a `Singleton` scope.

Allows you to create singleton instances that will be shared between multiple clients. In standard behavior, each declared provider will be automatically deleted and recreated for each new client. This functionality was made in order for us to be able to store both singletons, for example, cache, and various personalized data. For example, user status and personalization.

By default, all providers have the value `Scope.REQUEST`, which means that provider values ​​will be generated for each client. The exception is the `useValue` providers, which behave like a singleton.

:::tip

It is incorrect to use `Scope.REQUEST` providers as dependencies of `Scope.SINGLETON` providers. Only one `Request` provider instance will be created for `Singleton` providers. If this `Request` provider is stateful, it can lead to unexpected behavior. If provider is stateless, `Singleton` scope is optimal for performance.

:::

```tsx
import { provide } from '@tramvai/core';

const provider = provide({
  provide: CACHE,
  useFactory: Cache,
  scope: Scope.SINGLETON,
});
```

In this case, the `CACHE` provider will be registered as a global singleton, since the `scope` parameter was passed and a single instance for all users will be used.

## Tokens

Tokens are used as an identifier for the provider in DI. By the value of the token, the provider is registered and the implementation is searched.

Our recommendation is to use CAMEL_CASE for tokens names. Also, you need to pass TS interface to `createToken` generic function to correct type inference, and a **unique** string as token name to avoid possible collisions.

```tsx
import { provide, createToken } from '@tramvai/core';

const LOGGER_TOKEN = createToken<Logger>('my-app-scope logger');

const provider = provide({
  provide: LOGGER_TOKEN,
  useClass: Logger,
});
```

### Multi token

As in [multi providers example](#multi-providers), you need to pass `{ multi: true }` options to `createToken`.

```tsx
import { provide, createToken } from '@tramvai/core';

const MULTI_TOKEN = createToken<() => void>('multi token', { multi: true });
```

### Scoped token

It is possible to create [scoped provider](#scope) automatically, by passing `scope` parameter to `createToken` options. It is very useful for popular tokens, like `commandLineRunnerTokens`.

```tsx
import { provide, createToken, Scope } from '@tramvai/core';

const CACHE = createToken<Cache>('cache', { scope: Scope.SINGLETON });

const provider = provide({
  provide: CACHE,
  useFactory: Cache,
});
```

You can always override this behaviour by declare different `scope` parameter in provider.
