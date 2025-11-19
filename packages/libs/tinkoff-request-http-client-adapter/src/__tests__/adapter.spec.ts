import type { Express, Handler } from 'express';
import type { HttpClientError, HttpClientBaseOptions } from '@tramvai/http-client';

import {
  startMockServer,
  delayResponseWithFakeTimers,
} from '@tramvai/internal-test-utils/utils/simpleMockServer';
import {
  createLoggerMocks,
  clearLoggerMocks,
} from '@tramvai/internal-test-utils/mocks/tramvai/logger';
import {
  createCacheMocks,
  mockCacheImplementation,
  clearCacheMocks,
  createCacheMock,
} from '@tramvai/internal-test-utils/mocks/tramvai/cache';
import { createAdapter } from '../createAdapter';

const { loggerMock, loggerFactoryMock } = createLoggerMocks();
const { cacheMock, cacheFactoryMock } = createCacheMocks();

const applyFastResponseHandler = (app: Express) => {
  app.get('/fake', async (req, res) => {
    await delayResponseWithFakeTimers(100);
    res.send('ok');
  });
};

const applySlowResponseHandler = (app: Express) => {
  app.get('/fake', async (req, res) => {
    await delayResponseWithFakeTimers(200);
    res.send('ok');
  });
};

const successHandler: Handler = async (req, res) => {
  res.send('ok');
};

const applySuccessResponseHandler = (app: Express) => {
  app.get('/fake', successHandler);
};

describe('@tinkoff/request to HttpClient adapter', () => {
  afterEach(() => {
    clearLoggerMocks({ loggerMock, loggerFactoryMock });
    clearCacheMocks({ cacheMock, cacheFactoryMock });
  });

  describe('features', () => {
    it('defaultTimeout, fast response - success', async () => {
      const { port, terminate } = await startMockServer(applyFastResponseHandler);
      const httpClient = createAdapter({ logger: loggerFactoryMock, defaultTimeout: 500 });

      const { payload } = await httpClient.request({ url: `http://localhost:${port}/fake` });

      expect(payload).toBe('ok');

      await terminate();
    });

    it('defaultTimeout, slow response - error', async () => {
      const { port, terminate } = await startMockServer(applySlowResponseHandler);
      const httpClient = createAdapter({ logger: loggerFactoryMock, defaultTimeout: 100 });

      let error: HttpClientError | null = null;

      try {
        await httpClient.request({ url: `http://localhost:${port}/fake` });
      } catch (e) {
        error = e as HttpClientError;
      }

      expect(error?.message).toBe('Request timed out');
      expect(error?.status).toBe(undefined);
      expect(error?.headers).toEqual({});

      await terminate();
    });

    it('timeout, fast response - success', async () => {
      const { port, terminate } = await startMockServer(applyFastResponseHandler);
      const httpClient = createAdapter({ logger: loggerFactoryMock, defaultTimeout: 2000 });

      const { payload } = await httpClient.request({
        url: `http://localhost:${port}/fake`,
        timeout: 500,
      });

      expect(payload).toBe('ok');

      await terminate();
    });

    it('timeout, slow response - error', async () => {
      const { port, terminate } = await startMockServer(applySlowResponseHandler);
      const httpClient = createAdapter({ logger: loggerFactoryMock, defaultTimeout: 2000 });

      let error: HttpClientError | null = null;
      try {
        await httpClient.request({ url: `http://localhost:${port}/fake`, timeout: 100 });
      } catch (e) {
        error = e as HttpClientError;
      }

      expect(error?.message).toBe('Request timed out');
      expect(error?.status).toBe(undefined);
      expect(error?.headers).toEqual({});

      await terminate();
    });

    it('baseUrl concat with path', async () => {
      const { port, terminate } = await startMockServer(applySuccessResponseHandler);
      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
      });

      const { payload } = await httpClient.request({
        path: 'fake',
      });

      expect(payload).toBe('ok');

      await terminate();
    });

    it('baseUrl without slash, path without slash', async () => {
      const { port, terminate } = await startMockServer(applySuccessResponseHandler);
      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}`,
      });

      const { payload } = await httpClient.request({
        path: 'fake',
      });

      expect(payload).toBe('ok');

      await terminate();
    });

    it('baseUrl and path has slashes', async () => {
      const { port, terminate } = await startMockServer(applySuccessResponseHandler);
      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
      });

      const { payload } = await httpClient.request({
        path: '/fake',
      });

      expect(payload).toBe('ok');

      await terminate();
    });

    it('baseUrl without slash, path has slash', async () => {
      const { port, terminate } = await startMockServer(applySuccessResponseHandler);
      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}`,
      });

      const { payload } = await httpClient.request({
        path: '/fake',
      });

      expect(payload).toBe('ok');

      await terminate();
    });

    it('path without baseUrl', async () => {
      const { port, terminate } = await startMockServer(applySuccessResponseHandler);
      const httpClient = createAdapter({
        logger: loggerFactoryMock,
      });

      const { payload } = await httpClient.request({ path: `http://localhost:${port}/fake` });

      expect(payload).toBe('ok');

      await terminate();
    });

    it('baseUrl without path', async () => {
      const { port, terminate } = await startMockServer(applySuccessResponseHandler);
      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/fake`,
      });

      const { payload } = await httpClient.request({});

      expect(payload).toBe('ok');

      await terminate();
    });

    it('baseUrl ignores with url', async () => {
      const { port, terminate } = await startMockServer(applySuccessResponseHandler);
      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:WRONG/`,
      });

      const { payload } = await httpClient.request({
        url: `http://localhost:${port}/fake`,
      });

      expect(payload).toBe('ok');

      await terminate();
    });

    it('cache, default implementation', async () => {
      const firstHandler = jest.fn(successHandler);
      const secondHandler = jest.fn(successHandler);

      const applyMockHandlers = (app: Express) => {
        app.get('/first', firstHandler);
        app.get('/second', secondHandler);
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);
      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
      });

      await httpClient.get('first');
      await httpClient.get('first');
      await httpClient.get('second');

      expect(firstHandler).toHaveBeenCalledTimes(1);
      expect(secondHandler).toHaveBeenCalledTimes(1);

      await terminate();
    });

    it('cache, custom implementation', async () => {
      mockCacheImplementation(cacheMock);

      const firstHandler = jest.fn(successHandler);
      const secondHandler = jest.fn(successHandler);

      const applyMockHandlers = (app: Express) => {
        app.get('/first', firstHandler);
        app.get('/second', secondHandler);
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);
      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        createCache: cacheFactoryMock,
        baseUrl: `http://localhost:${port}/`,
      });

      await httpClient.get('first');
      await httpClient.get('first');
      await httpClient.get('second');

      expect(cacheFactoryMock).toHaveBeenCalled();
      expect(firstHandler).toHaveBeenCalledTimes(1);
      expect(secondHandler).toHaveBeenCalledTimes(1);

      await terminate();
    });

    it('disableCache disable cache by default', async () => {
      const firstHandler = jest.fn(successHandler);
      const secondHandler = jest.fn(successHandler);

      const applyMockHandlers = (app: Express) => {
        app.get('/first', firstHandler);
        app.get('/second', secondHandler);
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);
      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
        disableCache: true,
      });

      await httpClient.request({ path: 'first' });
      await httpClient.request({ path: 'first' });
      await httpClient.request({ path: 'second' });
      await httpClient.request({ path: 'second' });

      expect(firstHandler).toHaveBeenCalledTimes(2);
      expect(secondHandler).toHaveBeenCalledTimes(2);

      await terminate();
    });

    it('disableCache allow cache by demand', async () => {
      const firstHandler = jest.fn(successHandler);
      const secondHandler = jest.fn(successHandler);

      const applyMockHandlers = (app: Express) => {
        app.get('/first', firstHandler);
        app.get('/second', secondHandler);
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);
      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
        disableCache: true,
      });

      await httpClient.request({ path: 'first', cache: true });
      await httpClient.request({ path: 'first', cache: true });
      await httpClient.request({ path: 'second', cache: true });
      await httpClient.request({ path: 'second', cache: true });

      expect(firstHandler).toHaveBeenCalledTimes(1);
      expect(secondHandler).toHaveBeenCalledTimes(1);

      await terminate();
    });

    it('disableCache disables deduplication', async () => {
      const firstHandler = jest.fn(successHandler);

      const applyMockHandlers = (app: Express) => {
        app.get('/first', firstHandler);
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);
      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
        disableCache: true,
      });

      await httpClient.request({ path: 'first' });
      await httpClient.request({ path: 'first' });

      expect(firstHandler).toHaveBeenCalledTimes(2);

      await terminate();
    });

    it('disableCache allows deduplication by demand', async () => {
      const firstHandler = jest.fn(successHandler);

      const applyMockHandlers = (app: Express) => {
        app.get('/first', firstHandler);
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);
      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
        disableCache: true,
      });

      await Promise.all([
        httpClient.request({ path: 'first', cache: true }),
        httpClient.request({ path: 'first', cache: true }),
      ]);

      expect(firstHandler).toHaveBeenCalledTimes(1);

      await terminate();
    });

    it('cached requests include response status code', async () => {
      const STATUS = 204;
      const handler: Handler = jest.fn((_, res) => {
        res.status(STATUS).send();
      });
      const { port, terminate } = await startMockServer((app) => {
        app.get('/json', handler);
      });
      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
      });

      const [{ status: first }, { status: second }] = await Promise.all([
        httpClient.request({ path: 'json' }),
        httpClient.request({ path: 'json' }),
      ]);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(first).toBe(STATUS);
      expect(first).toEqual(second);

      await terminate();
    });

    it('cache, disabled', async () => {
      const firstHandler = jest.fn(successHandler);
      const secondHandler = jest.fn(successHandler);

      const applyMockHandlers = (app: Express) => {
        app.get('/first', firstHandler);
        app.get('/second', secondHandler);
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);
      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
      });

      await httpClient.request({ path: 'first', cache: false });
      await httpClient.request({ path: 'first', cache: false });
      await httpClient.request({ path: 'second', cache: false });
      await httpClient.request({ path: 'second', cache: false });

      expect(firstHandler).toHaveBeenCalledTimes(2);
      expect(secondHandler).toHaveBeenCalledTimes(2);

      await terminate();
    });

    it('circuit breaker', async () => {
      const errorHandlerMock = jest.fn(async (req, res) => {
        res.status(500).send('error');
      });
      const applyMockHandlers = (app: Express) => {
        app.get('/fake', errorHandlerMock);
      };
      const { port, terminate } = await startMockServer(applyMockHandlers);
      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
        enableCircuitBreaker: true,
      });

      const startedReqCount = 10;
      const sentReqCount = 6;
      let error: HttpClientError | null = null;

      for (let i = 1; i <= startedReqCount; i++) {
        try {
          await httpClient.get('fake');
        } catch (e) {
          error = e as HttpClientError;
        }
      }

      expect(errorHandlerMock).toHaveBeenCalledTimes(sentReqCount);

      expect(error?.__meta).toMatchObject({
        CIRCUIT_BREAKER: {
          open: true,
        },
      });
      expect(error?.status).toBe(undefined);
      expect(error?.headers).toEqual({});

      await terminate();
    });

    it('errorModificator', async () => {
      const response = {
        error: {
          message: 'Internal Server Error',
        },
      };

      const { port, terminate } = await startMockServer((app: Express) => {
        app.get('/fake', async (req, res) => {
          res.status(500).json(response);
        });
      });

      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
        errorModificator: (state) => {
          return Object.assign(state.error, { errorId: 'FAKE_API' });
        },
      });

      let error: HttpClientError | null = null;

      try {
        await httpClient.get('fake');
      } catch (e) {
        error = e as HttpClientError;
      }

      expect(error?.url).toBe(`http://localhost:${port}/fake`);
      expect(error?.status).toBe(500);
      expect(error?.body).toEqual(response);
      expect(error?.errorId).toBe('FAKE_API');
      expect(error?.headers).toMatchObject({ 'content-type': 'application/json; charset=utf-8' });

      await terminate();
    });

    it('validator', async () => {
      const applyMockHandlers = (app: Express) => {
        app.get('/error', async (req, res) => {
          res.status(200).json({
            error: {
              message: 'Not Found',
            },
          });
        });
        app.get('/success', async (req, res) => {
          res.status(200).json({
            result: 'ok',
          });
        });
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);

      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
        validator: (state) => {
          if ((state.response as any).result) {
            return;
          }
          return new Error((state.response as any).error.message);
        },
      });

      const { payload } = await httpClient.get('success');

      let error: HttpClientError | null = null;

      try {
        await httpClient.get('error');
      } catch (e) {
        error = e as HttpClientError;
      }

      expect(payload).toEqual({ result: 'ok' });
      expect(error?.message).toBe('Not Found');

      await terminate();
    });

    it('errorValidator', async () => {
      const applyMockHandlers = (app: Express) => {
        app.get('/non-critical-api', async (req, res) => {
          res.status(404).json({
            result: 'Not Found',
          });
        });
      };
      const { port, terminate } = await startMockServer(applyMockHandlers);
      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
        errorValidator: (state) => {
          return (state.error as any).status === 404;
        },
      });

      const { status, payload } = await httpClient.get('non-critical-api');

      expect(status).toBe(404);
      expect(payload).toEqual({ result: 'Not Found' });

      await terminate();
    });

    describe('etag cache', () => {
      const successEtagHandler: Handler = async (req, res) => {
        res
          .header('Etag', `W/"5dca1bec61ab1517853fbbf5a7dd0acd"`)
          .send({ content: 'any-file-content' });
      };

      const notModifiedEtagHandler: Handler = async (req, res) => {
        res.status(304).send();
      };

      it('default implementation', async () => {
        const staticFileHandler = jest.fn();

        const applyMockHandlers = (app: Express) => {
          app.get('/static-file', staticFileHandler);
        };

        const { port, terminate } = await startMockServer(applyMockHandlers);
        const httpClient = createAdapter({
          logger: loggerFactoryMock,
          baseUrl: `http://localhost:${port}/`,
          allowStale: false,
          etagCacheOptions: {
            enabled: true,
          },
        });

        staticFileHandler.mockImplementationOnce(successEtagHandler);
        const originalResponse = await httpClient.get('static-file');

        // get from memory cache
        await httpClient.get('static-file');

        // wait until cached results become stale
        jest.advanceTimersByTime(60 * 1000);

        staticFileHandler.mockImplementationOnce(notModifiedEtagHandler);
        // get from etag cache
        const etagCacheResponse = await httpClient.get('static-file');

        expect(etagCacheResponse.payload).toBe(originalResponse.payload);

        // get from memory cache again
        await httpClient.get('static-file');

        expect(staticFileHandler).toHaveBeenCalledTimes(2);

        await terminate();
      });

      it('different name with memory cache', async () => {
        const createCacheMock = jest.fn();

        createAdapter({
          name: 'api',
          logger: loggerFactoryMock,
          baseUrl: `http://localhost:${1234}/`,
          allowStale: false,
          createCache: createCacheMock,
          etagCacheOptions: {
            enabled: true,
          },
        });

        expect(createCacheMock.mock.calls.map((call) => call[0].name)).toEqual([
          'http-client-api',
          'http-client-etag-api',
        ]);
      });

      it('cached requests include response status code when etag cache plugin enabled', async () => {
        const handler: Handler = jest.fn();
        const { port, terminate } = await startMockServer((app) => {
          app.get('/json', handler);
        });
        const httpClient = createAdapter({
          logger: loggerFactoryMock,
          baseUrl: `http://localhost:${port}/`,
          allowStale: false,
          etagCacheOptions: {
            enabled: true,
          },
        });

        (handler as jest.Mock).mockImplementationOnce(successEtagHandler);
        await httpClient.request({ path: 'json' });

        (handler as jest.Mock).mockImplementationOnce(notModifiedEtagHandler);
        const [{ status: first }, { status: second }] = await Promise.all([
          httpClient.request({ path: 'json' }),
          httpClient.request({ path: 'json' }),
        ]);

        expect(handler).toHaveBeenCalledTimes(1);
        expect(first).toBe(200);
        expect(first).toEqual(second);

        await terminate();
      });

      it('custom implementation', async () => {
        const memoryCacheMock = createCacheMock();
        mockCacheImplementation(memoryCacheMock);

        const etagCacheMock = createCacheMock();
        mockCacheImplementation(etagCacheMock);

        const createCustomCache = jest
          .fn()
          .mockReturnValueOnce(memoryCacheMock)
          .mockReturnValueOnce(etagCacheMock);

        const staticFileHandler = jest.fn();

        const applyMockHandlers = (app: Express) => {
          app.get('/static-file', staticFileHandler);
        };

        const { port, terminate } = await startMockServer(applyMockHandlers);
        const httpClient = createAdapter({
          logger: loggerFactoryMock,
          baseUrl: `http://localhost:${port}/`,
          createCache: createCustomCache,
          allowStale: false,
          etagCacheOptions: {
            enabled: true,
          },
        });

        expect(createCustomCache).toHaveBeenCalledTimes(2);

        staticFileHandler.mockImplementationOnce(successEtagHandler);
        await httpClient.get('static-file');

        expect(memoryCacheMock.set).toHaveBeenCalled();
        expect(etagCacheMock.set).toHaveBeenCalled();

        await httpClient.get('static-file');

        expect(memoryCacheMock.get).toHaveBeenCalled();
        expect(etagCacheMock.get).not.toHaveBeenCalled();

        // imitate a case when cached results become stale
        memoryCacheMock.clear();

        staticFileHandler.mockImplementationOnce(notModifiedEtagHandler);
        await httpClient.get('static-file');

        expect(etagCacheMock.get).toHaveBeenCalled();

        expect(staticFileHandler).toHaveBeenCalledTimes(2);

        await terminate();
      });

      it('disableCache disable Etag cache by default', async () => {
        const staticFileHandler = jest.fn();

        const applyMockHandlers = (app: Express) => {
          app.get('/static-file', staticFileHandler);
        };

        const { port, terminate } = await startMockServer(applyMockHandlers);
        const httpClient = createAdapter({
          logger: loggerFactoryMock,
          baseUrl: `http://localhost:${port}/`,
          allowStale: false,
          etagCacheOptions: {
            enabled: true,
          },
          disableCache: true,
        });

        staticFileHandler.mockImplementationOnce(successEtagHandler);
        await httpClient.get('static-file');

        staticFileHandler.mockImplementationOnce(notModifiedEtagHandler);
        const request = httpClient.get('static-file');

        await expect(request).rejects.toEqual(expect.objectContaining({ status: 304 }));
        expect(staticFileHandler).toHaveBeenCalledTimes(2);

        await terminate();
      });

      it('disableCache allow cache by demand', async () => {
        const staticFileHandler = jest.fn();

        const applyMockHandlers = (app: Express) => {
          app.get('/static-file', staticFileHandler);
        };

        const { port, terminate } = await startMockServer(applyMockHandlers);
        const httpClient = createAdapter({
          logger: loggerFactoryMock,
          baseUrl: `http://localhost:${port}/`,
          allowStale: false,
          etagCacheOptions: {
            enabled: true,
          },
          disableCache: true,
        });

        staticFileHandler.mockImplementationOnce(successEtagHandler);
        const originalResponse = await httpClient.request({
          path: 'static-file',
          etagCache: true,
        });

        staticFileHandler.mockImplementationOnce(notModifiedEtagHandler);
        const etagCacheResponse = await httpClient.request({
          path: 'static-file',
          etagCache: true,
        });

        expect(staticFileHandler).toHaveBeenCalledTimes(2);
        expect(etagCacheResponse.payload).toBe(originalResponse.payload);

        await terminate();
      });

      it('etagCache, disabled', async () => {
        const staticFileHandler = jest.fn();

        const applyMockHandlers = (app: Express) => {
          app.get('/static-file', staticFileHandler);
        };

        const { port, terminate } = await startMockServer(applyMockHandlers);
        const httpClient = createAdapter({
          logger: loggerFactoryMock,
          baseUrl: `http://localhost:${port}/`,
          allowStale: false,
          etagCacheOptions: {
            enabled: true,
          },
        });

        staticFileHandler.mockImplementationOnce(successEtagHandler);
        await httpClient.request({ path: 'static-file', etagCache: false });

        staticFileHandler.mockImplementationOnce(notModifiedEtagHandler);
        await httpClient.request({ path: 'static-file', etagCache: false });

        expect(staticFileHandler).toHaveBeenCalledTimes(1);

        await terminate();
      });
    });
  });

  describe('requests', () => {
    it('support GET, POST, PUT and DELETE', async () => {
      const applyMockHandlers = (app: Express) => {
        app.get('/fake', async (req, res) => {
          res.send('ok GET');
        });
        app.post('/fake', async (req, res) => {
          res.send('ok POST');
        });
        app.put('/fake', async (req, res) => {
          res.send('ok PUT');
        });
        app.delete('/fake', async (req, res) => {
          res.send('ok DELETE');
        });
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);

      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
      });

      expect((await httpClient.request({ path: 'fake' })).payload).toBe('ok GET');
      expect((await httpClient.get('fake')).payload).toBe('ok GET');

      expect((await httpClient.request({ path: 'fake', method: 'post' })).payload).toBe('ok POST');
      expect((await httpClient.request({ path: 'fake', method: 'POST' })).payload).toBe('ok POST');
      expect((await httpClient.post('fake')).payload).toBe('ok POST');

      expect((await httpClient.request({ path: 'fake', method: 'put' })).payload).toBe('ok PUT');
      expect((await httpClient.request({ path: 'fake', method: 'PUT' })).payload).toBe('ok PUT');
      expect((await httpClient.put('fake')).payload).toBe('ok PUT');

      expect((await httpClient.request({ path: 'fake', method: 'delete' })).payload).toBe(
        'ok DELETE'
      );
      expect((await httpClient.request({ path: 'fake', method: 'DELETE' })).payload).toBe(
        'ok DELETE'
      );
      expect((await httpClient.delete('fake')).payload).toBe('ok DELETE');

      await terminate();
    });

    it('query parameters', async () => {
      const applyMockHandlers = (app: Express) => {
        app.get('/fake', async (req, res) => {
          if (req.query.foo === 'bar') {
            return res.send('ok');
          }
          res.status(404).send('Not Found');
        });
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);

      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
      });

      const { payload } = await httpClient.get('fake', { query: { foo: 'bar' } });

      expect(payload).toBe('ok');

      await terminate();
    });

    it('request body', async () => {
      const applyMockHandlers = (app: Express) => {
        app.post('/fake', async (req, res) => {
          if (req.body.foo === 'bar') {
            return res.send('ok');
          }
          res.status(500).send('Invalid Body');
        });
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);

      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
      });

      const { payload } = await httpClient.post('fake', { body: { foo: 'bar' } });

      expect(payload).toBe('ok');

      await terminate();
    });

    it('request headers', async () => {
      const applyMockHandlers = (app: Express) => {
        app.get('/fake', async (req, res) => {
          if (req.headers.foo === 'bar') {
            return res.send('ok');
          }
          res.status(404).send('Not Found');
        });
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);

      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
      });

      const { payload } = await httpClient.get('fake', { headers: { foo: 'bar' } });

      expect(payload).toBe('ok');

      await terminate();
    });

    it('response status and headers', async () => {
      const applyMockHandlers = (app: Express) => {
        app.post('/fake', async (req, res) => {
          res.header('X-App-Id', 'test');
          res.status(201).send('ok');
        });
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);

      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
      });

      const { status, headers, payload } = await httpClient.post('fake');

      expect(status).toBe(201);
      expect(headers['x-app-id']).toBe('test');
      expect(payload).toBe('ok');

      await terminate();
    });

    describe('interceptors', () => {
      it('modify request', async () => {
        const applyMockHandlers = (app: Express) => {
          app.get('/fake', async (req, res) => {
            if (req.query.wuid === '12345') {
              return res.send('ok');
            }
            res.status(404).send('Not Found');
          });
        };

        const { port, terminate } = await startMockServer(applyMockHandlers);

        const httpClient = createAdapter({
          logger: loggerFactoryMock,
          baseUrl: `http://localhost:${port}/`,
          interceptors: [
            (req, next) => {
              return next({
                ...req,
                query: {
                  ...req.query,
                  wuid: '123',
                },
              });
            },
            (req, next) => {
              return next({
                ...req,
                query: {
                  ...req.query,
                  wuid: `${req?.query?.wuid}45`,
                },
              });
            },
          ],
        });

        const { payload } = await httpClient.get('fake');

        expect(payload).toBe('ok');

        await terminate();
      });

      it('rewrite response', async () => {
        const applyMockHandlers = (app: Express) => {
          app.get('/fake', async (req, res) => {
            res.json({ result: 'ok' });
          });
        };

        const { port, terminate } = await startMockServer(applyMockHandlers);

        const httpClient = createAdapter({
          logger: loggerFactoryMock,
          baseUrl: `http://localhost:${port}/`,
          interceptors: [
            async (_res, _next) => {
              return {
                status: 200,
                headers: {},
                payload: 'intercepted',
              };
            },
          ],
        });

        const { payload } = await httpClient.get('fake');

        expect(payload).toBe('intercepted');

        await terminate();
      });

      it('modify response', async () => {
        const applyMockHandlers = (app: Express) => {
          app.get('/fake', async (req, res) => {
            res.json({ result: 'ok' });
          });
        };

        const { port, terminate } = await startMockServer(applyMockHandlers);

        const httpClient = createAdapter({
          logger: loggerFactoryMock,
          baseUrl: `http://localhost:${port}/`,
          interceptors: [
            (req, next) => {
              return next(req).then((res) => ({
                ...res,
                payload: (res.payload as any).result,
              }));
            },
          ],
        });

        const { payload } = await httpClient.get('fake');

        expect(payload).toBe('ok');

        await terminate();
      });
    });

    it('modifyRequest', async () => {
      const applyMockHandlers = (app: Express) => {
        app.get('/fake', async (req, res) => {
          if (req.query.wuid === '12345') {
            return res.send('ok');
          }
          res.status(404).send('Not Found');
        });
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);

      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
        modifyRequest: (req) => {
          return {
            ...req,
            query: {
              ...req.query,
              wuid: '12345',
            },
          };
        },
      });

      const { payload } = await httpClient.get('fake');

      expect(payload).toBe('ok');

      await terminate();
    });

    it('modifyResponse', async () => {
      const applyMockHandlers = (app: Express) => {
        app.get('/fake', async (req, res) => {
          res.json({ result: 'ok' });
        });
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);

      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
        modifyResponse: (res) => {
          return {
            ...res,
            payload: (res.payload as any).result,
          };
        },
      });

      const { payload } = await httpClient.get('fake');

      expect(payload).toBe('ok');

      await terminate();
    });

    it('modifyError', async () => {
      const applyMockHandlers = (app: Express) => {
        app.get('/fake', async (req, res) => {
          res.status(500).json({
            error: {
              message: 'Internal Server Error',
            },
          });
        });
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);

      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
        modifyError: (error) => {
          return Object.assign(error, { meta: 'some meta info' });
        },
      });

      let error: HttpClientError | null = null;

      try {
        await httpClient.get('fake');
      } catch (e) {
        error = e as HttpClientError;
      }

      expect(error?.meta).toBe('some meta info');
      expect(error?.status).toBe(500);
      expect(error?.headers).toMatchObject({ 'content-type': 'application/json; charset=utf-8' });

      await terminate();
    });

    it('add __meta to error object', async () => {
      const applyMockHandlers = (app: Express) => {
        app.get('/fake', async (req, res) => {
          res.status(500).json({
            error: {
              message: 'Internal Server Error',
            },
          });
        });
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);

      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
      });

      let error: HttpClientError | null = null;

      try {
        await httpClient.get('fake');
      } catch (e) {
        error = e as HttpClientError;
      }

      expect(error?.__meta).toEqual({
        cache: {
          deduplicateEnabled: true,
          deduplicateForce: false,
          enabled: true,
          forced: false,
          memoryEnabled: true,
          memoryForce: false,
        },
        log: {
          duration: expect.any(Number),
          end: expect.any(Number),
          start: expect.any(Number),
        },
      });

      await terminate();
    });

    it('apply default options', async () => {
      const handler = jest.fn(async (req, res) => {
        // merge query and headers, and replace body,
        // default modifyRequest run before request modifyRequest
        if (
          req.query.default_query === 'fake_query' &&
          req.headers['x-default-header'] === 'fake_header' &&
          !req.body.default_param &&
          req.query.req_query === 'fake_query' &&
          req.headers['x-req-header'] === 'fake_header' &&
          req.body.req_param === 'fake_param' &&
          req.query.query_from_default_modify === 'fake_query' &&
          req.query.query_from_req_modify === 'fake_query' &&
          req.query.query_replaced_on_modify === 'second_edition'
        ) {
          res.send('ok');
        } else {
          res.status(500).send('error');
        }
      });

      const applyMockHandlers = (app: Express) => {
        app.post('/fake', handler);
      };

      const { port, terminate } = await startMockServer(applyMockHandlers);

      const httpClient = createAdapter({
        logger: loggerFactoryMock,
        baseUrl: `http://localhost:${port}/`,
        cache: false,
        method: 'POST',
        query: {
          default_query: 'fake_query',
        },
        body: {
          default_param: 'fake_param',
        },
        headers: {
          'X-default-header': 'fake_header',
        },
        modifyRequest: (req) => {
          return {
            ...req,
            query: {
              ...req.query,
              query_from_default_modify: 'fake_query',
              query_replaced_on_modify: 'first_edition',
            },
          };
        },
      });

      const request: HttpClientBaseOptions = {
        path: 'fake',
        query: {
          req_query: 'fake_query',
        },
        body: {
          req_param: 'fake_param',
        },
        headers: {
          'X-req-header': 'fake_header',
        },
        modifyRequest: (req) => {
          return {
            ...req,
            query: {
              ...req.query,
              query_from_req_modify: 'fake_query',
              query_replaced_on_modify: 'second_edition',
            },
          };
        },
      };

      const { payload } = await httpClient.request(request);
      // test cache
      await httpClient.request(request);

      expect(payload).toBe('ok');
      expect(handler).toHaveBeenCalledTimes(2);

      await terminate();
    });
  });
});
