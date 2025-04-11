---
sidebar_position: 3
---

> Command to start development build in watch mode

## Options

### `-p`, `--port`

Allows to specify port on which app server will listen requests

```sh
tramvai start -p 8080 <app>
```

## React hot refresh

:::info

The feature is enabled by default

:::

It is possible to refresh react components without page similar to the way in works in [React Native](https://reactnative.dev/docs/fast-refresh).

Besides fash page refreshes (hot-reload) in that mode state is preserved for hooks `useState` and `useRef`.

> You can force resetting state by adding comment `// @refresh reset` to the file. It will reset state for the whole file.

When encounter syntax and runtime errors, fast-refresh plugin will await for the error resolving and after fix will continue to work as usual.

Constraints:

1. state for class components doesn't preserve
2. `useEffect`, `useMemo`, `useCallback` refresh on every code change despite their dependency list, it includes empty dependency list as well, e.g. `useEffect(() => {}, [])` will be executed on every refresh - this is undesirable behaviour but it teaches to write stable code which is resistant for the redundant renders

To enable this mode, add to `tramvai.json`:

```json
"hotRefresh": {
  "enabled": true
}
```

You can configure settings with `hotRefreshOptions` option, see details [in the docs of react-refresh](https://github.com/pmmmwh/react-refresh-webpack-plugin#options):

```json
"hotRefresh": {
  "enabled": true,
  "options": {
    "overlay": false // disable error overlay
  }
}
```

## Enable sourcemaps in dev mode

In `tramvai.json`

```json
"sourceMap": {
  "development": true
}
```

It is equivalent to `devtool: 'source-map'` in webpack config with `source-map-loader`.

In addition, it is possible to set one of the following values for the `devtool` option in webpack config: `eval-cheap-module-source-map`, `eval-cheap-source-map`, `eval-source-map`. For example, to set the option value to `eval-cheap-module-source-map`, add next lines to the `tramvai.json`:

```json
"webpack": {
  "devtool": "eval-cheap-module-source-map"
}
```

## How to

### Speed up development build

#### Build only specific bundles

App may contain of many bundles and the more there bundle, the more code get bundled to the app, the more long in building and rebuilding the app during development.

In order to speed up that process when running `@tramvai/cli` it is possible to specify bundles required for the development and cli will build only that bundles.

> Bundles should be placed in directory `bundles` and should be imported from the index app file.

> When trying to request bundle that was disabled, server will fail with status 500, as it is unexpected condition for the server that bundle is missing

```sh
# if you need only single bundle during development
tramvai start myapp --onlyBundles=account
# if you need several bundles
tramvai start myapp --onlyBundle=account,trading
```

### Starting the development server with the HTTPS protocol

In certain situations, you may want to run your application in a secure https environment. This can help address various issues, such as:

- Debugging [Mixed content](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content)
- Working with [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) and [PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Secure cookie](https://en.wikipedia.org/wiki/Secure_cookie)
- And more. For a full list, please refer to the MDN documentation on [Features restricted to secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts/features_restricted_to_secure_contexts)

:::warning Prerequisite:

Before executing the `tramvai start myapp --https` command, please ensure that you have installed the `mkcert` utility package. [mkcert](https://github.com/FiloSottile/mkcert) is a simple tool used for generating development certificates that are trusted locally. It requires no configuration. Refer to the [installation](https://github.com/FiloSottile/mkcert?tab=readme-ov-file#installation) section for detailed instructions.

:::

To start the Tramvai application in an `https` environment, you can utilize the `--https` flag. For the first time, when running this command, it may prompt for your computer password in order to generate the certificates correctly.

```sh
tramvai start myapp --https
```

`mkcert` will generate three files - `rootCA.pem`, `[key].pem`, `[cert].pem`:

- `[cert].pem` - is your server's public certificate that will be shared with the client during the SSL handshake.
- `[key].pem` - is your server's private key, used to establish a secure connection with the client through encryption and should be kept secure and private.
- `rootCA.pem` - is used to install a local CA on your system and trust certificates signed by it.

The first two files will be located in the `/certificates` folder within your root project directory, and if you have a `.gitignore` file, this folder will automatically be added to it. `rootCA.pem` certificate can be located in different places depending on your OS. To know exactly where is it located, you can run `mkcert -CAROOT` command.

To start the Tramvai application in an `https` environment and serve it on a custom local domain, you can use the `--host` flag. Before running the command below, make sure you have updated your system `/etc/hosts` file with the necessary changes. For example, if you want your application to be accessible from the domain `localhost.domain.com`, add the following line to your `/etc/hosts` file: `127.0.0.1 localhost.domain.com`. Once you have made the appropriate changes, execute the command below to start the application:

```sh
tramvai start myapp --https --host localhost.domain.com
```

:::warning Known issue:

[NodeJS does not use `rootCA` ceriticate by default](https://github.com/FiloSottile/mkcert?tab=readme-ov-file#using-the-root-with-nodejs). That is why NodeJS will not trust your `[cert].pem` and `[key].pem`. To avoid problems with that use `NODE_EXTRA_CA_CERTS` environment variable - `NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem" tramvai start myapp --https`

:::

:::tip

If you are using the `https` environment to debug your PWA application on an iOS simulator or iPhone, it is important to manually install the `rootCA.pem` file. To locate this file, use the `mkcert -CAROOT` command in your terminal. Generated certificates inside your project directory will not have any effect on the iOS simulator or iPhone if you attempt to install them directly. For more detailed information, please check the official mkcert documentation - [mobile devices](https://github.com/FiloSottile/mkcert?tab=readme-ov-file#mobile-devices)

:::

To start the Tramvai application in an `https` environment and use your own custom certificate, you can use the `--httpsKey` and `--httpsCert` flags. In this case, the application will not generate any certificates and will use the files you provide. It can be useful in case if you already have generated certificates trusted by your machine, for example certificates that were generated using `openssl` tool. Example:

```sh
tramvai start myapp --https --host localhost.domain.com --httpsKey ./path-to-certificates-folder/localhost-key.pem --httpsCert ./path-to-certificates-folder/localhost.pem
```
