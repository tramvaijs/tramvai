import { trace, context } from '@opentelemetry/api';
import type { LogObj } from '@tinkoff/logger';
import { provide } from '@tramvai/core';
import { LOGGER_INIT_HOOK } from '@tramvai/tokens-common';

export const providers = [
  provide({
    provide: LOGGER_INIT_HOOK,
    useValue: (loggerInstance) => {
      loggerInstance.addExtension({
        extend(logObj: LogObj): LogObj {
          const activeSpanContext = trace.getSpan(context.active())?.spanContext();

          if (activeSpanContext) {
            return {
              ...logObj,
              spanId: activeSpanContext.spanId,
              traceId: activeSpanContext.traceId,
            };
          }

          return logObj;
        },
      });
    },
  }),
];
