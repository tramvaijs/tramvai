import path from 'path';
import pluginTester from 'babel-plugin-tester';
import { configFactory } from '../../config-factory';

pluginTester({
  plugin: {}, // плагин уже есть в основном конфиге, если подключить ещё тут то babel упадёт
  pluginName: 'lazy-component',
  filename: path.join(__dirname, '..', '__fixtures__', 'lazy-component', 'test'),
  babelOptions: configFactory({
    typescript: true,
    generateDataQaTag: false,
    loader: false,
    hot: true,
    browsersListTargets: ['defaults'],
  }),
  tests: {
    'not lazy': {
      fixture: 'not-lazy.ts',
      snapshot: true,
    },
    'tramvai react but not lazy': {
      fixture: 'not-lazy-import.ts',
      snapshot: true,
    },
    base: {
      fixture: 'base.ts',
      snapshot: true,
    },
    'long import': {
      fixture: 'long-import.ts',
      snapshot: true,
    },
    dynamic: {
      fixture: 'dynamic.ts',
      snapshot: true,
    },
    comments: {
      fixture: 'comments.ts',
      snapshot: true,
    },
    hmr: {
      fixture: 'lazy+hmr.ts',
      snapshot: true,
    },
  },
});
