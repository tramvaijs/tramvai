/**
 * @jest-environment jsdom
 */
import { createErrorInterceptor } from './inlineErrorInterceptor.inline';

const NAMESPACE = '__TEST_NAMESPACE__';

describe('createErrorInterceptor', () => {
  let errorInterceptor: {
    clear: () => void;
    errorsQueue: Error[];
    onError: (error: Error) => void;
  };

  const onError = jest.fn();

  beforeEach(() => {
    window.addEventListener('error', onError);

    createErrorInterceptor(NAMESPACE);
    errorInterceptor = (window as any)[NAMESPACE];
  });
  afterEach(() => {
    errorInterceptor?.clear();
    window.removeEventListener('error', onError);
  });
  it('create namespace with correct fields', () => {
    expect(errorInterceptor.errorsQueue).toHaveLength(0);
    const error = new Error('sample error');

    errorInterceptor.onError(error);

    expect(errorInterceptor.errorsQueue).toHaveLength(1);
    expect(errorInterceptor.errorsQueue[0]).toEqual(error);
  });
  it('should correctly handle window.onerror event', async () => {
    const error = new Error('window error');
    window.dispatchEvent(new ErrorEvent('error', { error }));

    expect(onError).toHaveBeenCalledTimes(1);
    expect(errorInterceptor.errorsQueue).toHaveLength(1);
    expect(errorInterceptor.errorsQueue[0]).toBe(error);
  });
});
