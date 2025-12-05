import { startMockServer } from '@tramvai/internal-test-utils/utils/simpleMockServer';
import { TapableHooks } from '@tinkoff/hook-runner';
import { queueRequests, sendWarmUpRequest } from '../utils';

const flushPromises = () => new Promise(setImmediate);

const createHooks = () => {
  const hooks = new TapableHooks();
  const requestHook = hooks.createAsync<any, any>('cache-warmup:request');

  requestHook.tapPromise('CacheWarmupPlugin', async (_, { request, parameters }) => {
    try {
      await request(parameters);
      return {
        parameters,
        result: 'resolved',
      };
    } catch {
      return {
        parameters,
        result: 'rejected',
      };
    }
  });

  return {
    'cache-warmup:request': requestHook,
  };
};

describe('warmup/utils', () => {
  describe('queueRequests', () => {
    beforeEach(() => {});

    it('makes max N requests at the time', async () => {
      const requestsOptions = [1000, 1500, 1500, 1000];
      const makeRequest = jest.fn(
        (timeout: number) => new Promise((resolve) => setTimeout(resolve, timeout))
      );
      const max = 3;
      const hooks = createHooks();

      const result = queueRequests({ makeRequest, requestsOptions, maxSimultaneous: max, hooks });

      expect(makeRequest).toHaveBeenCalledTimes(3);

      jest.advanceTimersByTime(500);

      expect(makeRequest).toHaveBeenCalledTimes(3);

      jest.advanceTimersByTime(500);
      await flushPromises();

      expect(makeRequest).toHaveBeenCalledTimes(4);

      jest.runAllTimers();

      await expect(result).resolves.toEqual([
        { parameters: 1000, result: 'resolved' },
        { parameters: 1500, result: 'resolved' },
        { parameters: 1500, result: 'resolved' },
        { parameters: 1000, result: 'resolved' },
      ]);
    });

    it("doesn't crash if promises start getting rejected", async () => {
      const requestsOptions = [1500, 1500, 1000, 2000];
      const makeRequest = jest.fn(
        (timeout: number) =>
          new Promise((resolve, reject) => setTimeout(timeout >= 1500 ? reject : resolve, timeout))
      );
      const max = 2;
      const hooks = createHooks();

      const result = queueRequests({ makeRequest, requestsOptions, maxSimultaneous: max, hooks });

      expect(makeRequest).toHaveBeenCalledTimes(2);

      jest.advanceTimersByTime(1500);
      await flushPromises();

      expect(makeRequest).toHaveBeenCalledTimes(4);

      jest.runAllTimers();

      await expect(result).resolves.toEqual([
        { parameters: 1500, result: 'rejected' },
        { parameters: 1500, result: 'rejected' },
        { parameters: 1000, result: 'resolved' },
        { parameters: 2000, result: 'rejected' },
      ]);
    });
  });

  describe('sendWarmUpRequest', () => {
    it('should follow redirects', async () => {
      const mockHandler = jest.fn();

      const { port, terminate } = await startMockServer((app) => {
        app.get('*', (req, res) => {
          mockHandler(req.path);

          if (req.path === '/test') {
            return res.redirect('/test/');
          }

          res.end();
        });
      });

      await sendWarmUpRequest({
        url: `http://localhost:${port}/test`,
      });

      expect(mockHandler).toHaveBeenCalledWith('/test');
      expect(mockHandler).toHaveBeenCalledWith('/test/');

      await terminate();
    });
  });
});
