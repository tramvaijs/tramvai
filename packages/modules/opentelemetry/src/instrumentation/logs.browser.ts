import { provide } from '@tramvai/core';
import { HTTP_CLIENT_LOGGER_EXTENSION } from '@tramvai/tokens-http-client';

// W3C Trace Context:
// https://www.w3.org/TR/trace-context/#traceparent-header
//
// traceparent: <version>-<trace-id>-<parent-id>-<trace-flags>
const TRACEPARENT_PARTS_COUNT = 4;

function parseTraceparent(traceparent: string): { traceId: string; spanId: string } | undefined {
  const parts = traceparent.split('-');

  if (parts.length < TRACEPARENT_PARTS_COUNT) {
    return undefined;
  }

  return { traceId: parts[1], spanId: parts[2] };
}

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
