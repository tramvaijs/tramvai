import { declareModule, provide } from '@tinkoff/dippy';
import { defineTramvaiConfig } from '@tramvai/api/lib/config';
import { DEFINE_PLUGIN_OPTIONS_TOKEN, BUILD_EXTERNALS_TOKEN } from '@tramvai/plugin-rspack-builder';

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
      provide: BUILD_EXTERNALS_TOKEN,
      useFactory: () => {
        return ['@sotqa/mountebank-fork'];
      },
    }),
  ],
});

export default defineTramvaiConfig({
  plugins: [DefineOptionsPlugin],
  projects: {},
});
