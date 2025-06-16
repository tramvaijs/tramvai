import { declareModule, provide } from '@tinkoff/dippy';
import { defineTramvaiConfig } from '@tramvai/api/lib/config';
import { DEFINE_PLUGIN_OPTIONS_TOKEN } from '@tramvai/plugin-webpack-builder';

const DefineOptionsPlugin = declareModule({
  name: 'DefineOptionsPlugin',
  providers: [
    provide({
      provide: DEFINE_PLUGIN_OPTIONS_TOKEN,
      useValue: {
        'process.env.ENV_FROM_OPTIONS': JSON.stringify('from-options'),
      },
    }),
  ],
});

export default defineTramvaiConfig({
  plugins: [DefineOptionsPlugin],
  projects: {},
});
