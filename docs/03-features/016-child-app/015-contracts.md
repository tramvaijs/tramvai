---
id: contracts
title: Contracts
---

## Explanation

Microfrontends and Host applications can have a different set of relations, and most of them can be defined in two ways:

- Microfront requires dependency from Host
- Host requires dependency from Microfront

In Child Apps world, there is a few different types of dependencies, which can be required in microfrontend:

- [providers from host DI container](03-features/016-child-app/013-workflow.md#dependency-injection)
- [state from host application](03-features/016-child-app/05-state-management.md#how-to-subscribe-to-root-app-store)
- [shared libraries](03-features/016-child-app/014-module-federation.md)

Shared libraries is out of the scope of this guide, because different mechanism covers it - Module Federation.

Host state subscription is a special case of working with Root DI container.

**Contracts** mechanism, which will be explained in this guide, will cover two-way dependencies relationship between Microfront and Host.

### Default dependencies relationship

By default, Child App has **full access** to Root application DI container, as described in [this schema](03-features/016-child-app/013-workflow.md#dependency-injection).

This behavior allows to write less and ship faster, but also it is unsafe and can lead to bugs in producion environment:

- Child App and Host application has different release cycles
- Dependencies interfaces can be changed without backward compatibility
- Dependencies can be not provided or removed

Contracts mechanism was created to address these issues.

### Contracts and dependencies

With Contracts, access to Root DI container is **strictly limited** at Host application level. Only few core `tramvai` dependencies are available out of the box, and we can guarantee this dependencies compatibility between different Child App and Host application `tramvai` versions because of our matrix of integration tests.

Contracts are composed of several elements:

- specific Child Apps DI acces mode
- list of providers, which are passed from Root DI to Child App
- list of providers, which are required in Child App
- list of providers, which are passed from Child App DI to Host App
- list of providers, which are required in Host App
- contracts management and validation
- strong typing for contracts

In a nutshell, contract is a usual `tramvai` [provider](concepts/provider.md), which is required in one side and provided in another.

## Usage

Contracts already integrated in `@tramvai/module-child-app` module, no extra dependencies needed.

### Restricting access to DI container

For ability to incremental migration, there is a two access modes to Root DI from Child App:

- `whitelist` - full access to Root DI only for specified Child Apps
- `blacklist` - full access to Root DI for all Child Apps except specified

For example, if you want to migrate `header` Child App to Contracts mechanism, provide this `CHILD_APP_ROOT_DI_ACCESS_MODE_TOKEN` token in Host application:

```ts title="host/index.ts"
import { CHILD_APP_ROOT_DI_ACCESS_MODE_TOKEN } from '@tramvai/tokens-child-app';

const provider = provide({
  provide: CHILD_APP_ROOT_DI_ACCESS_MODE_TOKEN,
  useValue: {
    mode: 'blacklist',
    list: ['header'],
  },
});
```

### Request dependency in Child App

When access to Root DI is limited, we need to define required dependencies in Child App:

```ts title="header/index.ts"
import { CHILD_REQUIRED_CONTRACTS } from '@tramvai/tokens-child-app';

const provider = provide({
  provide: CHILD_REQUIRED_CONTRACTS,
  useValue: [MY_CHILD_CONTRACT],
});
```

This token can be resolved from Child App DI container (when provided in Host application):

```ts title="child/cmp.tsx"
const Cmp = () => {
  const myChildContract = useDi(MY_CHILD_CONTRACT);

  return '...';
};
```

### Provide dependency in Host application

Based on previous example, we need to declare and provide `MY_CHILD_CONTRACT` implementation in Host application:

```ts title="host/index.ts"
import { HOST_PROVIDED_CONTRACTS } from '@tramvai/tokens-child-app';

const providers = [
  // declare provided contracts here
  provide({
    provide: HOST_PROVIDED_CONTRACTS,
    useValue: {
      // optional field, if not specified - contracts will be provided for any Child App
      childAppName: 'header',
      providedContracts: [MY_CHILD_CONTRACT],
    },
  }),
  // implement provided contracts somewhere in Host providers and modules
  provide({
    provide: MY_CHILD_CONTRACT,
    useClass: MyChildContractImpl,
  }),
];
```

### Request dependency in Host application

Sometimes we need to request dependency from Child App in Host application, for example to manually submit microfronted form:

```ts title="host/index.ts"
import { HOST_REQUIRED_CONTRACTS } from '@tramvai/tokens-child-app';

const provider = provide({
  provide: HOST_REQUIRED_CONTRACTS,
  useValue: {
    childAppName: 'form',
    requiredContracts: [FORM_CONTRACT],
  },
});
```

This token can be resolved from Host DI container with `ContractManager` (when provided in Child App used on the current page):

```ts title="host/routes/index.tsx"
const submitChildAppForm = declareAction({
  name: 'submitChildAppForm',
  async fn() {
    const { childContractManager } = this.deps;

    // `getChildProvidedContract` is async, because we need to wait for Child App loading
    const formContract = await childContractManager.getChildProvidedContract('form', FORM_CONTRACT);

    // it is always a chance that Child App loading can be failed and contract will be undefined
    formContract?.submit();
  },
  deps: {
    childContractManager: CHILD_APP_CONTRACT_MANAGER,
  },
});
```

### Provide dependency in Child App

Based on previous example, we need to declare and provide `FORM_CONTRACT` implementation in Child App:

```ts title="form/index.ts"
import { CHILD_PROVIDED_CONTRACTS } from '@tramvai/tokens-child-app';

const providers = [
  // declare provided contracts here
  provide({
    provide: CHILD_PROVIDED_CONTRACTS,
    useValue: [FORM_CONTRACT],
  }),
  // implement provided contracts somewhere in Child App providers and modules
  provide({
    provide: FORM_CONTRACT,
    useClass: FormContractImpl,
  }),
];
```

### Contracts validation

Full contracts compatibility validation is possible only in runtime, because microfrontends and host app can be released in different times with different expected contracts versions.

But it doesn't mean that build-time validation is useless, and we can use type-checking in Host application to fail build pipeline (if contracts are not compatible).

At first, we need to add some boilerplate code in Host entry point to validate contracts types:

```ts title="host/index.ts"
import { Assert, ContractsValidation } from '@tramvai/tokens-child-app';

// if contracts are not compatible, human readable error will be thrown on type check
Assert({} as ContractsValidation);
```

For Child required contracts, we need to extend required contracts interface next to the contract token:

```ts title="header-contract/index.ts"
// `TypedContractsRequired` will be extended when `FORM_CONTRACT` will be imported in Host application
declare module '@tramvai/module-child-app' {
  export interface TypedContractsRequired {
    // fail validation if this token is not provided in host application
    MY_CHILD_CONTRACT: typeof MY_CHILD_CONTRACT;
  }
}

export const MY_CHILD_CONTRACT = createToken<MyChildContract>('my child contract');
```

In Host application, we need to extend provided contracts interface before `Assert` helper call (and of course we need to provide this contract):

```ts title="host/index.ts"
declare module '@tramvai/module-child-app' {
  export interface TypedContractsProvided {
    // fail validation if this token has a incompatible type in `TypedContractsRequired` interface
    MY_CHILD_CONTRACT: typeof MY_CHILD_CONTRACT;
  }
}
```

## FAQ

### How to deliver Contracts for Child Apps and Host applications?

TL;DR - provide Contracts as separate npm packages (one package for one or multiple Child Apps), update this packages as infrequently as you can.

Delivering Contracts as npm packages provides the following benefits:

- versioning out of the box
- reusability between microfrontends and host applications

Tramvai tokens chosen for Contracts declaration because of ability to provide strong typing and seamless integration with DI system.

So the contracts for Child Apps are set of Tramvai tokens wrapped in npm package. `@tramvai/build` can be used to build these packages.

For example:

<Tabs>
  <TabItem value="json" label="package.json" default>

```json title="header-contract/package.json"
{
  "name": "@scope/header-contract",
  "version": "1.0.0",
  "main": "index.js",
  "module": "index.es.js",
  "scripts": {
    "build": "tramvai-build --forPublish --preserveModules",
    "watch": "tsc -w"
  },
  "dependencies": {
    "@tinkoff/dippy": "^0.9.0"
  },
  "peerDependencies": {
    "@tramvai/module-child-app": ">=3.0.0"
  },
  "devDependencies": {
    "@tramvai/build": "^4.1.3",
    "@tramvai/module-child-app": "^3.40.67"
  }
}
```

  </TabItem>
  <TabItem value="ts" label="index.ts">

```tsx title="header-contract/index.ts"
import { createToken } from '@tinkoff/dippy';

declare module '@tramvai/module-child-app' {
  export interface TypedContractsProvided {
    MY_HEADER_CONTRACT: MyHeaderContract;
  }
}

export type MyHeaderContract = any;

export const MY_HEADER_CONTRACT = createToken<MyHeaderContract>('scope:my_header_contract');
```

  </TabItem>
</Tabs>

### How to migrate to Contracts incrementally?

@todo
