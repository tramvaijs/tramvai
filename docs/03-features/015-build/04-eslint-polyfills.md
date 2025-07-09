---
id: polyfills-eslint
title: Feature usage linting
---

## Default

When using polyfills from the `@tinkoff/pack-polyfills` package, you can enable ESLint rules from the `@tinkoff/eslint-plugin-tramvai` package. To do this, add the following to your `.eslintrc` config:

```json
{
  "extends": {
    "plugin:@tinkoff/tramvai/compat"
  }
}
```

This config uses the default list of polyfills from `@tinkoff/pack-polyfills` and the default browserslist query from `@tinkoff/browserslist-config`, and it forbids using language features for which no polyfills are provided.

## Extend Polyfill List / Custom Browserslist

If you expand the list of polyfills or change the browserslist in your project, the rule will start producing incorrect errors because it relies on the default settings. Fortunately, `@tinkoff/eslint-plugin-tramvai` can generate lint rules based on your custom settings. However, since ESLint does not allow accessing project settings or passing arguments during plugin initialization, you need a small setup:

1. Create a `.js` file next to your `.eslintrc` config (e.g., `eslint-plugin-tramvai.js`)

2. In this file, get the ESLint config based on your custom settings:

```js
const { getCustomEslintPlugin } = require('@tinkoff/eslint-plugin-tramvai');

// !important, provide root of your project (where package.json and tramvai.json are located)
// in most cases, this is __dirname
const { configs } = getCustomEslintPlugin(__dirname);

module.exports = { ...configs.compat };
```

The plugin will automatically use your custom browserslist config and the list of connected polyfills from the polyfill entrypoints.

3. Extend your ESLint config:

```json
{
  "extends": {
    "./eslint-plugin-tramvai"
  }
}
```

Make sure to remove the default `plugin:@tinkoff/tramvai/compat` config.

## Under the Hood

Internally, the plugin uses `eslint-plugin-es-x` and `eslint-plugin-compat`. `eslint-plugin-es-x` is used for linting ECMAScript APIs, and `eslint-plugin-compat` for linting Web APIs.

By default, `eslint-plugin-es-x` doesn’t support browserslist queries. To address this, the plugin uses `@automattic/eslint-config-target-es`, which maps a browserslist query to a set of rules that forbid usage of unsupported language features.

We’ve also added functionality to parse used polyfills from the project entrypoints and automatically disable rules when a polyfill is present. Unfortunately, this automatic detection only works for `core-js` polyfills and a few widely used libraries ([@formatjs](https://formatjs.github.io/docs/polyfills/) and [@petamoriken/float16](https://github.com/petamoriken/float16)).

## Extending Web Polyfills

Because we can’t predict which polyfill you’ll use for Web APIs, you need to manually add them (this is also true for Web APIs in core-js, such as `structuredClone`).

For example, to polyfill `ResizeObserver`, first add it in the polyfill entrypoint:

```ts
if (!('ResizeObserver' in window)) {
  require('resize-observer-polyfill/dist/ResizeObserver.global');
}
```

Then, tell `eslint-plugin-compat` that a polyfill is available by adding this to your ESLint config:

```json
{
  "settings": {
    "polyfills": ["ResizeObserver"]
  }
}
```

## Extending with Custom Polyfills

The same applies to custom polyfills or non-core-js polyfills. You need to manually disable the relevant rule:

```ts
import './my-custom-promise-try.polyfill';
```

```json
{
  "rules": [
    "es-x/no-promise-try": 0
  ]
}
```

[Full list of rules](https://eslint-community.github.io/eslint-plugin-es-x/)

## FAQ

### Does the custom setup work with legacy ESLint config?

Yes, it’s fully designed for legacy config. Flat config is not supported.
