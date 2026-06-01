import type { FastifyRequest } from 'fastify';
import type { DI_TOKEN, ExtractDependencyType } from '@tinkoff/dippy';
import { STORE_TOKEN } from '@tramvai/tokens-common';
import { HttpError, RedirectFoundError } from '@tinkoff/errors';
import { PapiResponse, PapiResultCode } from '@tramvai/papi';
import { setFormActionResult } from '../formActionStore';

/**
 * No-JS form submissions handler, routes requests to original PAPI for form action.
 */
export class FormActionRoutingService {
  async routeRequestToFormAction(
    request: FastifyRequest,
    di: ExtractDependencyType<typeof DI_TOKEN>
  ): Promise<void> {
    const store = di.get(STORE_TOKEN);

    const { pathname } = new URL(`http://localhost${request.url}`);
    const pathnameWithoutTrailingSlash =
      pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

    const isFormAction = request.server.hasRoute({
      method: 'POST',
      url: pathnameWithoutTrailingSlash,
      constraints: { accept: 'application/json' },
    });

    if (!isFormAction) {
      return;
    }

    // Removing headers Content-Length and Transfer-Encoding,
    // because Fastify's inject will calculate them automatically and can cause issues if they are present in the original request
    const {
      'content-length': _contentLength,
      'transfer-encoding': _transferEncoding,
      ...forwardedHeaders
    } = request.headers;

    // Passing original request body and headers to the original form action endpoint
    const response = await request.server.inject({
      method: request.method as any,
      url: pathname,
      headers: {
        ...forwardedHeaders,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      payload: JSON.stringify(request.body),
    });

    const result = JSON.parse(response.body) as PapiResponse;

    switch (result.resultCode) {
      case PapiResultCode.REDIRECT:
        throw new RedirectFoundError({
          nextUrl: result.nextUrl as string,
          httpStatus: response.statusCode,
        });
      case PapiResultCode.OK:
        store.dispatch(
          setFormActionResult({
            data: result.payload,
          })
        );
        return;
      case PapiResultCode.ERROR:
        store.dispatch(
          setFormActionResult({
            error: result.error,
          })
        );
        return;
    }

    throw new HttpError({
      httpStatus: response.statusCode,
      message: result.errorMessage ?? 'Form action failed',
    });
  }
}
