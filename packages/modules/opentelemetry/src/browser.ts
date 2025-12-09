import { Module } from '@tramvai/core';
import once from '@tinkoff/utils/function/once';

export * from './tokens';

export const extractTraceparentHeader = once((): string | undefined => {
  if (typeof window !== 'undefined') {
    const traceparentMeta = Array.from(document.getElementsByTagName('meta')).filter(
      (element) => element.name === 'traceparent'
    );

    if (traceparentMeta.length !== 1) {
      return undefined;
    }

    return traceparentMeta[0].content;
  }

  return undefined;
});

@Module({
  imports: [],
  providers: [],
})
export class OpenTelemetryModule {}
// todo declareModule!
