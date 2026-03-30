import { Module, commandLineListTokens, provide } from '@tramvai/core';
import { LOGGER_TOKEN } from '@tramvai/module-common';
import { initErrorInterceptorCommand } from './server/commands/init';

@Module({
  providers: [
    provide({
      provide: commandLineListTokens.init,
      multi: true,
      useFactory: initErrorInterceptorCommand,
      deps: {
        logger: LOGGER_TOKEN,
      },
    }),
  ],
})
export class ErrorInterceptorModule {}
