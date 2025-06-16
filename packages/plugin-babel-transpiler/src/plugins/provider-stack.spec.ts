import path from 'path';
import pluginTester from 'babel-plugin-tester';
import { configFactory } from '../config-factory';
import { providerStackPlugin } from './provider-stack';

pluginTester({
  plugin: providerStackPlugin,
  pluginName: 'provider-stack',
  filename: path.join(__dirname, '__fixtures__', 'provider-stack', 'test'),
  babelOptions: configFactory({
    typescript: true,
    generateDataQaTag: false,
    loader: false,
  }),
  tests: {
    'do nothing': {
      fixture: 'do-nothing.ts',
      snapshot: true,
    },
    'add __stack property to module decorator providers': {
      fixture: 'module-decorator.ts',
      snapshot: true,
    },
    'add __stack property external providers': {
      fixture: 'add-stack.ts',
      snapshot: true,
    },
    'add __stack property if Error in scope': {
      fixture: 'error-in-scope.ts',
      snapshot: true,
    },
    'inside await': {
      fixture: 'inside-await.ts',
      snapshot: true,
    },
  },
});

pluginTester({
  plugin: providerStackPlugin,
  pluginName: 'provider-stack',
  filename: path.join(__dirname, '__fixtures__', 'provider-stack', 'test'),
  babelOptions: configFactory({
    typescript: true,
    generateDataQaTag: false,
    loader: false,
    excludesPresetEnv: ['transform-function-name'],
  }),
  tests: {
    'check function naming': {
      fixture: 'check-function-name.ts',
      snapshot: true,
    },
  },
});
