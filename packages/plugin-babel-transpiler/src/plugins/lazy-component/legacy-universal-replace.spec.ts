import path from 'path';
import pluginTester from 'babel-plugin-tester';
import { configFactory } from '../../config-factory';

pluginTester({
  plugin: {}, // плагин уже есть в основном конфиге, если подключить ещё тут то babel упадёт
  pluginName: 'legacy-universal-replace',
  filename: path.join(__dirname, '..', '__fixtures__', 'legacy-universal-replace', 'test'),
  babelOptions: configFactory({
    typescript: true,
    generateDataQaTag: false,
    loader: false,
    browsersListTargets: ['defaults'],
  }),
  tests: {
    'not universal': {
      fixture: 'not-universal.ts',
      snapshot: true,
    },
    'react-universal': {
      fixture: 'react-universal.ts',
      snapshot: true,
    },
    'platform legacy': {
      fixture: 'platform-legacy.ts',
      snapshot: true,
    },
    'tramvai-react': {
      fixture: 'tramvai/react/index.es.ts',
      snapshot: true,
    },
  },
});
