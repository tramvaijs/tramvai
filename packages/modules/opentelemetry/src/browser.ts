import { Module, provide } from '@tramvai/core';
import once from '@tinkoff/utils/function/once';
import { DEFAULT_HTTP_CLIENT_INTERCEPTORS } from '@tramvai/tokens-http-client';
import { OPENTELEMETRY_HTTP_CLIENT_BROWSER_HEADERS_INCLUDE_TOKEN } from './tokens';

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
      useFactory:
        ({ headerInclude }) =>
        (req, next) => {
          const url = req.url ?? (req.baseUrl ? `${req.baseUrl}${req.path}` : (req.path ?? ''));

          if (!headerInclude(url)) {
            return next(req);
          }

          return next({
            ...req,
            headers: {
              traceparent: extractTraceparentHeader(),
              ...req.headers,
            },
          });
        },
      deps: {
        headerInclude: OPENTELEMETRY_HTTP_CLIENT_BROWSER_HEADERS_INCLUDE_TOKEN,
      },
    }),
    provide({
      provide: OPENTELEMETRY_HTTP_CLIENT_BROWSER_HEADERS_INCLUDE_TOKEN,
      useValue: () => true,
    }),
  ],
})
export class OpenTelemetryModule {}
// todo declareModule!
