---
id: quick-start
title: Quick Start
---

[![Try it on CodeSandbox!](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/tramvai-new-qgk90?fontsize=14&hidenavigation=1&theme=dark)

Tramvai provides a powerful CLI for build and development processes - `@tramvai/cli`

## Prerequisites

- [Node.js version `16+`](https://nodejs.org/en/download)

## New application

You can generate a new application and install required dependencies by one command:

```sh
npm init @tramvai@latest awesome-app --registry=https://registry.npmjs.org/
```

After starting, you need to select settings - application type, project template, package manager and testing framework. For a quick start, the default settings are fine.

## Development

Now we need to run our application in watch mode, for easy development and to check that our project is working. To do this, execute the command:

```bash
cd awesome-app && npm start
```

This command will start a server in dev mode that will monitor the server and client code. After executing the command, you can go to the address `http://localhost:3000/` and see the lifted clean application.

## Application structure

A quick overview of the structure of the application that generates by `tramvai new` command. At the same time, we support both monorepositories and repositories with one application.

We recommend follow [feature-sliced methodology](https://feature-sliced.design/) guidlines to structure application code.

### Repository type

#### Multirepo

The repository structure is designed for one application

```bash
root-directory
├── tramvai.json - project configuration for `@tramvai/cli`
├── env.development.js - environment variables used for local builds of the project
└── src - application code directory
    └── App block
```

#### Monorepo

The repository structure is designed for the presence of several applications, and separate shared libraries

```bash
root-directory
├── tramvai.json - project configuration for `@tramvai/cli`
├── env.development.js - environment variables used for local builds of the project
├── apps - directory with applications
│   ├── App block
│   ├── App block
└── packages - a directory with various libraries / modules that will be shared between applications
    ├── Lib block
    └── Lib block
```

### Blocks

#### Application

```bash
app-directory
├── index.ts - application entry point, where all tramvai modules are connected
├── polyfill.ts - polyfills used by the application (absent by default)
├── postcss.js - postcss configuration object
├── shared - reused modules of the application
└── routes - application pages
```
