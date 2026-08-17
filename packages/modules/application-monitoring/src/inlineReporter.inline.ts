import type {
  InlineReporterExtension,
  InlineReporterExtensionFactory,
  InlineReporterParameters,
  InlineReporterTransport,
  InlineReporterTransportFactory,
  TramvaiInlineReporter,
} from './types';

export function inlineReporter(parameters: InlineReporterParameters): TramvaiInlineReporter {
  // nested inside inlineReporter on purpose: this whole function is serialized via
  // Function.prototype.toString() and reconstructed in the browser, so it cannot close over
  // anything declared outside its own body - a module-level helper simply would not exist there
  function safeCall(fn: InlineReporterTransport, event: string, payload: Record<string, any>) {
    try {
      fn(event, payload);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  const _extensions: InlineReporterExtension[] = [];
  const _transports: InlineReporterTransport[] = [];

  const reporter: TramvaiInlineReporter = {
    // applies `parameters` right here, once per registration - a transport/extension factory
    // never has to worry about where its config comes from
    registerExtension(extensionFactory: InlineReporterExtensionFactory) {
      _extensions.push(extensionFactory(parameters));
    },
    registerTransport(transportFactory: InlineReporterTransportFactory) {
      _transports.push(transportFactory(parameters));
    },
    send(event: string, payload?: Record<string, any>) {
      // payload is piped through the extension chain like middleware: each extension gets
      // whatever the previous one returned, and either extends it or returns it unchanged
      let extendedPayload = payload || {};
      for (let i = 0; i < _extensions.length; i++) {
        try {
          extendedPayload = _extensions[i](event, extendedPayload) || extendedPayload;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        }
      }

      _transports.forEach((fn) => safeCall(fn, event, extendedPayload));
    },
  };

  return reporter;
}
