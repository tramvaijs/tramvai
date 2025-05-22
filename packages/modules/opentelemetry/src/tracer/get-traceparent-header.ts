import { TramvaiTracer } from '../tokens';

export const getTraceparentHeader = (tracer: TramvaiTracer): string | undefined =>
  tracer.propagateContext().traceparent;
