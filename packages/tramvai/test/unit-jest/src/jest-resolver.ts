const enhancedResolver = require('./resolver');

const resolver = (
  request: string,
  options: {
    basedir: string;
    defaultResolver: (request: string, options: unknown) => string;
  }
) => {
  const { basedir } = options;

  if (request.startsWith('@tinkoff') || request.startsWith('@tramvai')) {
    try {
      const result = enhancedResolver(basedir, request);
      return result;
    } catch (err) {
      const e = new Error(`Cannot resolve '${request}' from '${basedir}'`);
      // @ts-expect-error
      e.code = 'MODULE_NOT_FOUND';
      throw e;
    }
  } else {
    return options.defaultResolver(request, options);
  }
};

module.exports = resolver;
