import path from 'path';
import pluginTester from 'babel-plugin-tester';
import babelConfig from '../index';

pluginTester({
  plugin: {}, // плагин уже есть в основном конфиге, если подключить ещё тут то babel упадёт
  pluginName: 'fill-declare-action-name',
  filename: path.join(__dirname, '__fixtures__', 'fill-declare-action-name', 'test'),
  babelOptions: babelConfig({
    typescript: true,
    generateDataQaTag: false,
    loader: false,
    enableFillDeclareActionNamePlugin: true,
  }),
  tests: {
    'import: fill absent name': {
      fixture: 'import-mixed.ts',
      snapshot: true,
    },
    'import: do nothing': {
      fixture: 'import-with-name.ts',
      snapshot: true,
    },
    'import: fill all actions': {
      fixture: 'import-without-name.ts',
      snapshot: true,
    },
    'require: do nothing': {
      fixture: 'require-with-name.ts',
      snapshot: true,
    },
    'require: fill all actions': {
      fixture: 'require-without-name.ts',
      snapshot: true,
    },
  },
});
