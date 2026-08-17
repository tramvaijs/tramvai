import { inlineReporter } from './inlineReporter.inline';

describe('inlineReporter', () => {
  it('calls all registered transports with the extension-processed payload', () => {
    const reporter = inlineReporter({ appName: 'test' });
    const transportA = jest.fn();
    const transportB = jest.fn();

    reporter.registerExtension!(() => (eventName, payload) => ({ ...payload, userId: 'user-123' }));
    reporter.registerTransport!(() => transportA);
    reporter.registerTransport!(() => transportB);

    reporter.send('html-opened', { foo: 'bar' });

    expect(transportA).toHaveBeenCalledWith('html-opened', { foo: 'bar', userId: 'user-123' });
    expect(transportB).toHaveBeenCalledWith('html-opened', { foo: 'bar', userId: 'user-123' });
  });

  it('passes its own parameters to every registered transport/extension factory', () => {
    const parameters = { appName: 'test', path: '/foo' };
    const reporter = inlineReporter(parameters);
    const transportFactory = jest.fn(() => jest.fn());
    const extensionFactory = jest.fn(
      () => (eventName: string, payload: Record<string, any>) => payload
    );

    reporter.registerTransport!(transportFactory);
    reporter.registerExtension!(extensionFactory);

    expect(transportFactory).toHaveBeenCalledWith(parameters);
    expect(extensionFactory).toHaveBeenCalledWith(parameters);
  });

  it("chains extensions, each seeing the previous one's added fields", () => {
    const reporter = inlineReporter({ appName: 'test' });
    const transport = jest.fn();

    reporter.registerExtension!(() => (eventName, payload) => ({ ...payload, userId: 'user-123' }));
    reporter.registerExtension!(() => (eventName, payload) => ({
      ...payload,
      regionId: `region-for-${payload.userId}`,
    }));
    reporter.registerTransport!(() => transport);

    reporter.send('html-opened');

    expect(transport).toHaveBeenCalledWith('html-opened', {
      userId: 'user-123',
      regionId: 'region-for-user-123',
    });
  });

  it('lets an extension return the payload unchanged for events it does not care about', () => {
    const reporter = inlineReporter({ appName: 'test' });
    const transport = jest.fn();

    reporter.registerExtension!(() => (eventName, payload) => {
      if (eventName !== 'html-opened') {
        return payload;
      }
      return { ...payload, regionId: 'region-123' };
    });
    reporter.registerTransport!(() => transport);

    reporter.send('unhandled-error', { error: 'boom' });

    expect(transport).toHaveBeenCalledWith('unhandled-error', { error: 'boom' });
  });

  it('catches a throwing extension and continues the chain with the pre-throw payload', () => {
    const reporter = inlineReporter({ appName: 'test' });
    const transport = jest.fn();
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    reporter.registerExtension!(() => (eventName, payload) => ({ ...payload, userId: 'user-123' }));
    reporter.registerExtension!(() => () => {
      throw new Error('broken extension');
    });
    reporter.registerExtension!(() => (eventName, payload) => ({
      ...payload,
      regionId: 'region-123',
    }));
    reporter.registerTransport!(() => transport);

    reporter.send('html-opened');

    expect(transport).toHaveBeenCalledWith('html-opened', {
      userId: 'user-123',
      regionId: 'region-123',
    });
    expect(consoleError).toHaveBeenCalledTimes(1);

    consoleError.mockRestore();
  });

  it('falls back to the previous payload when an extension returns nothing', () => {
    const reporter = inlineReporter({ appName: 'test' });
    const transport = jest.fn();

    reporter.registerExtension!(() => (eventName, payload) => ({ ...payload, userId: 'user-123' }));
    // forgot to return - a common mistake, should not wipe out the payload
    reporter.registerExtension!(() => () => undefined as any);
    reporter.registerTransport!(() => transport);

    reporter.send('html-opened');

    expect(transport).toHaveBeenCalledWith('html-opened', { userId: 'user-123' });
  });

  it('catches a throwing transport without affecting other transports', () => {
    const reporter = inlineReporter({ appName: 'test' });
    const workingTransport = jest.fn();
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    reporter.registerTransport!(() => () => {
      throw new Error('broken transport');
    });
    reporter.registerTransport!(() => workingTransport);

    reporter.send('html-opened');

    expect(workingTransport).toHaveBeenCalledWith('html-opened', {});
    expect(consoleError).toHaveBeenCalledTimes(1);

    consoleError.mockRestore();
  });
});
