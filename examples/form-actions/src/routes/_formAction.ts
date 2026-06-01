// eslint-disable-next-line import/no-default-export
import { createFormAction } from '@tramvai/papi';
import { throwRedirectFoundError } from '@tinkoff/errors';

export default createFormAction({
  async handler({ body }) {
    const responseType = body.responseType ?? 'json';

    switch (responseType) {
      case 'json':
        return {
          result: 'Hello, world!',
          username: body.username ?? 'Anonymous',
        };
      case 'redirect':
        throwRedirectFoundError({ nextUrl: '/success', httpStatus: 303 });
    }
  },
});
