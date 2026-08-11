// W3C Trace Context:
// https://www.w3.org/TR/trace-context/#traceparent-header
//
// traceparent: <version>-<trace-id>-<parent-id>-<trace-flags>
const TRACEPARENT_VERSION = '00';
const TRACEPARENT_SAMPLED_FLAG = '01';
const TRACEPARENT_PARTS_COUNT = 4;

type TraceparentContext = {
  traceId: string;
  spanId: string;
};

/**
 * Build a W3C `traceparent` header from a span context.
 */
export const formatTraceparent = ({ traceId, spanId }: TraceparentContext): string =>
  `${TRACEPARENT_VERSION}-${traceId}-${spanId}-${TRACEPARENT_SAMPLED_FLAG}`;

/**
 * Parse `traceId`/`spanId` out of a W3C `traceparent` header.
 */
export const parseTraceparent = (traceparent: string): TraceparentContext | undefined => {
  const parts = traceparent.split('-');

  if (parts.length < TRACEPARENT_PARTS_COUNT) {
    return undefined;
  }

  return { traceId: parts[1], spanId: parts[2] };
};
