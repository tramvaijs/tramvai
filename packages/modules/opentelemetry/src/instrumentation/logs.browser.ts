import { provide } from '@tramvai/core';
import { HTTP_CLIENT_LOGGER_EXTENSION } from '@tramvai/tokens-http-client';
import { parseTraceparent } from '../tracer/traceparent';

export const providers = [
  provide({
    provide: HTTP_CLIENT_LOGGER_EXTENSION,
    multi: true,
    useValue: (logObj, context) => {
      const request = context.getRequest();
      const traceparent = (request.headers as { traceparent?: string } | undefined)?.traceparent;

      if (traceparent === undefined) {
        return logObj;
      }

      const parsed = parseTraceparent(traceparent);

      if (!parsed) {
        return logObj;
      }

      return {
        ...logObj,
        traceId: parsed.traceId,
        spanId: parsed.spanId,
      };
    },
  }),
];
