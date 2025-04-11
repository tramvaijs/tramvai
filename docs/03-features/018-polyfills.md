---
id: polyfills
title: Polyfills Integration
---

# Polyfills

Tramvai has polyfills integration:

- there is a separate library `@tinkoff/pack-polyfills` that contains all the necessary polyfills
- `@tramvai/cli` builds polyfills in a separate file.
- `@tramvai/module-render` contains code that only loads polyfills where they are needed.

## Setup

### Create a file polyfill.ts

You need to create a file `polyfill.ts` inside your project, for example, `src/polyfill.ts`, and connect the polyfills inside:

```ts
import '@tinkoff/pack-polyfills';
```

It is recommended to connect polyfills as a flat list for more precise control.

```ts
import 'core-js/modules/es.array.at';
import 'core-js/modules/es.array.concat';
import 'core-js/modules/es.array.copy-within';
import 'core-js/modules/es.array.fill';
import 'core-js/modules/es.array.filter';
import 'core-js/modules/es.array.find-index';
import 'core-js/modules/es.array.find';
import 'core-js/modules/es.array.flat-map';
import 'core-js/modules/es.array.flat';
import 'core-js/modules/es.array.from';
// ...
```

### Set up @tramvai/cli

After that, we need to tell `@tramvai/cli` that our project has polyfills. To do this, add the line `"polyfill": "src/polyfill.ts"` in `projects[APP_ID].polyfill` inside `tramvai.json`. Example:

```json
{
  "projects": {
    "pfphome": {
      "name": "pfphome",
      "root": "src",
      "type": "application",
      "polyfill": "src/polyfill.ts"
    }
  }
}
```

## How polyfills loading works

On the `@tramvai/cli` side, we have configured the build to generate polyfills as a separate file, so they don't mix with the main code. With every build, there will be a file containing polyfills.

[module-render](references/modules/render.md) checks for polyfills in the build. If they are found, it embeds inline code for each client to check feature availability in the browser. If the browser does not support a feature, it is considered legacy, and polyfills are loaded. The polyfill necessity check is generated automatically based on the provided polyfills list.

## Notes about polyfill condition generation

To generate the polyfill loading condition, we use the list of imported polyfills from the `polyfill.ts` entrypoint. A Webpack plugin analyzes all imported `core-js` modules and constructs an object containing language features that appeared last in browsers:

```json
{
  "chrome": {
    "spec": "es.object.has-own",
    "version": "93"
  },
  "chrome-android": {
    "spec": "es.object.has-own",
    "version": "93"
  },
  "edge": {
    "spec": "es.object.has-own",
    "version": "93"
  },
  "firefox": {
    "spec": "es.array.includes",
    "version": "102"
  },
  "ios": {
    "spec": "es.array.at",
    "version": "15.4"
  },
  "opera": {
    "spec": "es.object.has-own",
    "version": "79"
  },
  "opera_mobile": {
    "spec": "es.object.has-own",
    "version": "66"
  },
  "safari": {
    "spec": "es.array.at",
    "version": "15.4"
  },
  "samsung": {
    "spec": "es.object.has-own",
    "version": "17.0"
  }
}
```

As a result, we get the following check:

`!(Object.hasOwn) || !('at' in window.Array.prototype)`

This check is executed in the browser, and if it evaluates to true, polyfills will be loaded. There is no need to check for all polyfills inside the entrypoint — if `Object.hasOwn` is available, it guarantees the presence of all earlier features.

Using this mechanism, polyfills are delivered only to a small percentage of users with outdated browsers (Chrome <= 93). However, caution is required to avoid breaking compatibility or unnecessarily increasing the browser version threshold for polyfill loading.

`@tinkoff/pack-polyfills` package under the hood connects a flat list of polyfills, from which part of polyfills that included by default in `preset-env` have been removed. These remaining methods are not yet widely used and significantly raise the baseline for polyfill inclusion. You can find the full list of missing polyfills in [test](https://github.com/tramvaijs/tramvai/blob/main/examples/polyfills/src/modern.polyfill.ts). You can manually add these polyfills to your project (it is recommended to include them in the modern entrypoint).

### How to check polyfill conditions, features, and browser versions

You can find this information in the `stats.json` file in the final build.

## Extending the polyfill condition loading check

### Why is it necessary?

Automatic generation of the check condition applies only to `core-js` polyfills. If you want to add a third-party polyfill that is not part of `core-js`, you need to manually add a condition (e.g., `IntersectionObserver`).

### Important tips

- Replace `POLYFILL_CONDITION` with your additional check.
- Your custom check should return `true` if the browser does not support the feature.

### Extending the check

To achieve this, set the provider `POLYFILL_CONDITION`, which is imported from `@tramvai/module-render` and pass a new condition.

Example: Suppose we want to check for the presence of `window.ResizeObserver`. The resulting expression should return `true` if the browser does not support the feature.

```ts
import { POLYFILL_CONDITION } from '@tramvai/module-render';
import { provide } from '@tramvai/core';

const provider = provide({
  provide: POLYFILL_CONDITION,
  useValue: `!('ResizeObserver' in window)`,
});
```

## Extending the list of polyfills

To add a new polyfill, import it from `core-js/modules`. The polyfill condition generation will account for this addition.

```ts title="polyfill.ts"
import '@tinkoff/pack-polyfills';

// Chrome 97+
import 'core-js/modules/es.array.find-last';
```

## Modern polyfills

Apart from polyfills in `polyfill.ts`, there is an option to connect polyfills via the `modern polyfill` entrypoint. It works the same way, and to enable it, add `modernPolyfill` with the file path in `tramvai.json`. By default, it is `src/modern.polyfill.ts`.

```json
{
  "projects": {
    "pfphome": {
      "name": "pfphome",
      "root": "src",
      "type": "application",
      "modernPolyfill": "src/modern.polyfill.ts"
    }
  }
}
```

Unlike the standard `polyfill` entry point, `modernPolyfill` is always loaded without conditions. This mechanism allows new language features to be used without increasing the polyfill condition version threshold.

```ts title="modern.polyfill.ts"
// Chrome 128+
import 'core-js/modules/es.promise.try';
```

### Web polyfills

To include a web polyfill, import it in `polyfill.ts` (and ensure the polyfill condition is updated).

```ts title="polyfill.ts"
import '@tinkoff/pack-polyfills';

if (!('ResizeObserver' in window)) {
  require('resize-observer-polyfill/dist/ResizeObserver.global');
}
```

Alternatively, add it to `modern.polyfill.ts` if the API was recently introduced.

```ts title="modern.polyfill.ts"
if (!('share' in window.navigator)) {
  require('share-api-polyfill');
}
```
