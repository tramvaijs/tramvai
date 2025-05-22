import { Module, provide } from '@tramvai/core';
import once from '@tinkoff/utils/function/once';
import { DEFAULT_HTTP_CLIENT_INTERCEPTORS } from '@tramvai/tokens-http-client';

export * from './tokens';

const extractTraceparentHeader = once((): string | undefined => {
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
  providers: [
    provide({
      provide: DEFAULT_HTTP_CLIENT_INTERCEPTORS,
      useValue: (req, next) =>
        next({
          ...req,
          headers: {
            traceparent: extractTraceparentHeader(),
            ...req.headers,
          },
        }),
    }),
  ],
})
export class OpenTelemetryModule {}
// todo declareModule!
