import { declareModule, provide } from '@tinkoff/dippy';
import { defineTramvaiConfig } from '@tramvai/api/lib/config';
import {
  DEFINE_PLUGIN_OPTIONS_TOKEN,
  WEBPACK_EXTERNALS_TOKEN,
} from '@tramvai/plugin-webpack-builder';
import { BUILD_TARGET_TOKEN } from '@tramvai/plugin-webpack-builder/lib/webpack/webpack-config';

const DefineOptionsPlugin = declareModule({
  name: 'DefineOptionsPlugin',
  providers: [
    provide({
      provide: DEFINE_PLUGIN_OPTIONS_TOKEN,
      useValue: {
        'process.env.ENV_FROM_OPTIONS': JSON.stringify('from-options'),
      },
    }),
    provide({
      provide: WEBPACK_EXTERNALS_TOKEN,
      useFactory: ({ buildTarget }) => {
        return ['@sotqa/mountebank-fork'];
      },
      deps: {
        buildTarget: BUILD_TARGET_TOKEN,
      },
    }),
  ],
});

export default defineTramvaiConfig({
  plugins: [DefineOptionsPlugin],
  projects: {},
});
