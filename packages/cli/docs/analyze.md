Allow to analyze app output bundle

## See what is got bundled

The special webpack plugin [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) able to show every modules get bundled

For running analyze

```sh
npx tramvai analyze APP_ID
```

After that app will be built in prod mode and a new tab in browser will be opened

## Figure out why dependency got bundled

With that can help utility [whybundled](https://github.com/d4rkr00t/whybundled) that parses the webpack `stats.json` file and can show the reason why dependency has been added to bundle

Run next command

```sh
npx tramvai analyze APP_ID --plugin whybundled
```

After that a special version of `stats.json` can be found inside `outputClient` directory. The exact path will be showed in your terminal

Next, you can run `whybundled` to resolve reasons:

```sh
# why `debug` got bundled
npx whybundled ./dist/client/stats.json debug

# what dependencies were bundled because of the `debug` package
npx whybundled ./dist/client/stats.json --by debug
```

See more options [in the whybundled docs](https://github.com/d4rkr00t/whybundled)

## Research your bundle stats

One of the options is to use `statoscope` plugin to analyze your bundle.

Statoscope is a toolkit for analyzing (with a UI-based report) and validate stats of your bundle.

```sh
# generates result json file
npx tramvai analyze APP_ID --plugin statoscope
```

When the command is finished, pass the result file to https://statoscope.tech/ tool.
