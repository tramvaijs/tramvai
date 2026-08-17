/**
 * @jest-environment @tramvai/test-unit-jest/lib/jsdom-environment
 */
import { errorMonitoringScript } from './errorMonitoringScript.inline';

describe('errorMonitoringScript', () => {
  let listeners: Record<string, (event: any) => void>;
  let send: jest.Mock;

  beforeEach(() => {
    listeners = {};
    jest.spyOn(window, 'addEventListener').mockImplementation(((type: string, handler: any) => {
      listeners[type] = handler;
    }) as any);

    send = jest.fn();
    (window as any).__TRAMVAI_INLINE_REPORTER = { send };

    errorMonitoringScript();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as any).__TRAMVAI_INLINE_REPORTER;
    document.body.innerHTML = '';
  });

  describe('error enumerability', () => {
    it('makes the error JSON-serializable before sending unhandled-error, so transports get message/stack out of the box', () => {
      const error = new Error('boom');

      listeners.error({
        error,
        message: 'Uncaught Error: boom',
        filename: 'a.js',
        lineno: 1,
        colno: 2,
        timeStamp: 123,
      });

      expect(send).toHaveBeenCalledWith('unhandled-error', expect.objectContaining({ error }));

      const roundTripped = JSON.parse(JSON.stringify(error));
      expect(roundTripped.message).toBe('boom');
      expect(roundTripped.stack).toEqual(expect.any(String));
    });

    it('makes the promise rejection reason JSON-serializable before sending unhandled-rejection', () => {
      const reason = new Error('rejected');

      listeners.unhandledrejection({ reason });

      expect(send).toHaveBeenCalledWith('unhandled-rejection', { error: reason });

      const roundTripped = JSON.parse(JSON.stringify(reason));
      expect(roundTripped.message).toBe('rejected');
      expect(roundTripped.stack).toEqual(expect.any(String));
    });

    it('does not fail on a non-Error rejection reason', () => {
      listeners.unhandledrejection({ reason: 'plain string reason' });

      expect(send).toHaveBeenCalledWith('unhandled-rejection', { error: 'plain string reason' });
    });

    it('sends asset-load-failed with a JSON-serializable error for ASSET_LOAD_FAIL errors', () => {
      const error = Object.assign(new Error('asset failed'), {
        code: 'ASSET_LOAD_FAIL',
        retry: 'failed',
        originalUrl: 'https://cdn.example/chunk.js',
      });

      listeners.error({
        error,
        message: 'Uncaught Error: asset failed',
        filename: 'https://cdn.example/chunk.js',
        lineno: 1,
        colno: 1,
        timeStamp: 1,
      });

      expect(send).toHaveBeenCalledWith('asset-load-failed', expect.objectContaining({ error }));

      const roundTripped = JSON.parse(JSON.stringify(error));
      expect(roundTripped.message).toBe('asset failed');
    });
  });

  describe('error event branching', () => {
    it('sends only app-start-failed, not unhandled-error, for an appCreationError-flagged error', () => {
      const error = Object.assign(new Error('init failed'), { appCreationError: true });

      listeners.error({ error, message: 'Uncaught Error: init failed' });

      expect(send).toHaveBeenCalledWith('app-start-failed', { error });
      expect(send).not.toHaveBeenCalledWith('unhandled-error', expect.anything());
    });

    it('sends only asset-load-failed, not unhandled-error, for an ASSET_LOAD_FAIL error', () => {
      const error = Object.assign(new Error('asset failed'), {
        code: 'ASSET_LOAD_FAIL',
        retry: 'failed',
        originalUrl: 'a.js',
      });

      listeners.error({ error, message: 'Uncaught Error: asset failed' });

      expect(send).toHaveBeenCalledWith('asset-load-failed', expect.objectContaining({ error }));
      expect(send).not.toHaveBeenCalledWith('unhandled-error', expect.anything());
    });

    it('sends unhandled-error for a plain error with neither flag', () => {
      const error = new Error('just a bug');

      listeners.error({ error, message: 'Uncaught Error: just a bug' });

      expect(send).toHaveBeenCalledWith('unhandled-error', expect.objectContaining({ error }));
      expect(send).not.toHaveBeenCalledWith('app-start-failed', expect.anything());
      expect(send).not.toHaveBeenCalledWith('asset-load-failed', expect.anything());
    });

    it('sends nothing for a bare resource-load error event with no Error object', () => {
      listeners.error({ error: undefined, message: '' });

      expect(send).not.toHaveBeenCalled();
    });
  });

  describe('load event - critical assets reconciliation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('sends critical-assets-loaded when nothing failed', () => {
      listeners.load({});
      jest.runAllTimers();

      expect(send).toHaveBeenCalledWith('critical-assets-loaded');
    });

    it('sends critical-assets-load-failed with the failed url when a critical asset never recovered', () => {
      const error = Object.assign(new Error('asset failed'), {
        code: 'ASSET_LOAD_FAIL',
        retry: 'failed',
        originalUrl: 'https://cdn.example/chunk.js',
      });
      listeners.error({ error, message: 'boom' });

      listeners.load({});
      jest.runAllTimers();

      expect(send).toHaveBeenCalledWith('critical-assets-load-failed', {
        urls: ['https://cdn.example/chunk.js'],
      });
    });

    it('reconciles a recovered retry (loaded=true tag) and sends critical-assets-loaded instead', () => {
      const error = Object.assign(new Error('asset failed'), {
        code: 'ASSET_LOAD_FAIL',
        retry: 'failed',
        originalUrl: 'https://cdn.example/chunk.js',
      });
      listeners.error({ error, message: 'boom' });

      const script = document.createElement('script');
      script.dataset.src = 'https://cdn.example/chunk.js';
      script.setAttribute('loaded', 'true');
      document.body.appendChild(script);

      listeners.load({});
      jest.runAllTimers();

      expect(send).toHaveBeenCalledWith('critical-assets-loaded');
      expect(send).not.toHaveBeenCalledWith('critical-assets-load-failed', expect.anything());
    });

    it('does not track a successfully-retried asset (retry=success) as a failed critical asset', () => {
      const error = Object.assign(new Error('asset ok on retry'), {
        code: 'ASSET_LOAD_FAIL',
        retry: 'success',
        originalUrl: 'https://cdn.example/chunk.js',
      });
      listeners.error({ error, message: 'boom' });

      listeners.load({});
      jest.runAllTimers();

      expect(send).toHaveBeenCalledWith('critical-assets-loaded');
      expect(send).not.toHaveBeenCalledWith('critical-assets-load-failed', expect.anything());
    });
  });
});
