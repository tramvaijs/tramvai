---
id: react-compiler
title: React Compiler
---

## Overview

React Compiler (aka Forget) – is a tool developed by the React core team, that takes the original components code, and tries to convert it into code where components, their props, and hooks dependencies are memoized by default. The main purpose of React Compiler is to allow developers do not think about memoization, e.g. using `React.memo`, `useMemo`, and `useCallback`, which can be very difficult to do correctly.

Essentially React Compiler is a Babel plugin, that transforms source code. Tramvai provides an integration with React Compiler out of the box.

- :::note

Though we are observing up to 20% increased client render performance in some cases, React Compiler is still experimental tool, so use it carefully.

:::

## Usage

First, enable React Compiler in `tramvai.json`:

```json
{
  "experiments": {
    "reactCompiler": true
  }
}
```

Second, install `babel-plugin-react-compiler`:

```bash npm2yarn
npm i --save-dev babel-plugin-react-compiler@beta
```

Also, if you are using React 18 or below, you need to install `react-compiler-runtime`:

```bash npm2yarn
npm i --save react-compiler-runtime@beta
```

That's it! After that, your source code will be transformed by React Compiler.

## Adoption

1. React compiler is an experimental tool, so we recommend to use it gradually. First of all, check your codebase for readiness for React Compiler:

```npm
npx react-compiler-healthcheck
```

It will display summary about your project and changes, that will be made by React Compiler.

2. Second, install ESLint plugin, to check specific places in your code which can not be handled by React Compiler:

```bash npm2yarn
npm i --save-dev eslint-plugin-react-compile
```

```eslintrc.js
module.exports = {
  plugins: [
    'eslint-plugin-react-compiler',
  ],
  rules: {
    'react-compiler/react-compiler': 'error',
  },
}
```

3. Determine small folders, where you can apply React Compiler and use in `tramvai.json`:

```json
"experiments": {
  "reactCompiler": {
    "sources": ["src/catalogs"]
  }
}
```

4. Test your changes carefully. When you have more confidence with rolling out the compiler, you can expand coverage to other directories as well and slowly roll it out to your whole app.

### Unsupported cases

#### usePageService/useRoute

Essentially React Compiler relies on variable references. In terms of Tramvai it means that anything coming from DI, will be broken by React Compiler optimizations. For example, this code:

```tsx
export const Footer = () => {
  const pageService = usePageService();
  const ModalComponent = pageService.getComponent('modal');

  return (
    <div className={styles.footer}>
      <div>this Footer in fs-routing</div>

      {ModalComponent !== undefined && <ModalComponent />}
    </div>
  );
};
```

will be transformed into:

```tsx
import { c as _c } from 'react/compiler-runtime';

export const Footer = () => {
  const $ = _c(7);
  const pageService = usePageService();

  let t0;
  if ($[0] !== pageService) {
    t0 = pageService.getComponent('modal');
    $[0] = pageService;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  const ModalComponent = t0;

  // ...
};
```

How you can see, now component will not re-render during route change. The only way to fix it is to add "use no memo" directive to Footer:

```tsx
export const Footer = () => {
  'use no memo';

  // ...
};
```

## How to

### Watch the influence

React DevTools (v5.0+) have built-in support for React Compiler and will display a “Memo ✨” badge next to components that have been optimized by the compiler.

Also, if you are interested with what exactly compiler does with your code, you can visit [React Compiler Playground](https://playground.react.dev/).

### Opting out of React Compiler

1. Specify directories, where you want to enable React Compiler via `tramvai.json`:

```json
"experiments": {
  "reactCompiler": {
    "sources": ["src/catalogs"]
  }
}
```

2. Use "use no memo" directive. It's also works with hooks:

```tsx
function SuspiciousComponent() {
  'use no memo'; // opts out this component from being compiled by React Compiler
  // ...
}
```

::: note

It is not recommended to reach for this directive unless it’s strictly necessary. Once you opt-out a component or hook, it is opted-out forever until the directive is removed. This means that even if you fix the code, the compiler will still skip over compiling it unless you remove the directive.

:::

## Options

### `sources`

Array of paths which React compiler applies to. Ignore node_modules by default.

```json
"experiments": {
  "reactCompiler": {
    "sources": ["src/catalogs"]
  }
}
```

### `compilationMode`

Determines the strategy for determining which functions to compile.

```json
"experiments": {
  "reactCompiler": {
    "compilationMode": "annotation"
  }
}
```

#### infer (default)

React Compiler handles next cases:

- Functions, annotated with "use forget" directive;
- Components declared with component syntax;
- Functions which can be inferred to be a component or hook: be named like a hook or component (this logic matches the ESLint rule) _and_ create JSX and/or call a hook;

#### annotation

Compile only functions which are explicitly annotated with "use forget" annotation.

#### all

Compile all top-level functions.

### `panicThreshold`

Determines the point at which compiler should throw an error.

```json
"experiments": {
  "reactCompiler": {
    "panicThreshold": "critical_errors"
  }
}
```

#### none (default)

Never panic by throwing an exception.

#### critical_errors

Panic by throwing an exception only on critical or unrecognized errors. For all other errors, skip the erroring function without inserting a compiled version.

#### all_errors',

Any errors will panic the compiler by throwing an exception, which will break the build.

## Source links

- [React Compiler overview](https://react.dev/learn/react-compiler)
- [Friendly explanation about compiler usage](https://www.developerway.com/posts/i-tried-react-compiler)
