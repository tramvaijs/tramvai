/**
 * @description By default, `Error` properties are not enumerable.
 * So when you use `Object.keys()`, `JSON.stringify()`, or `postMessage()`,
 * the `message`, `stack`, and `cause` properties are not included.
 */
export function enumerateErrorProperties(error: Error) {
  Object.defineProperties(error, {
    message: {
      configurable: true,
      enumerable: true,
      writable: true,
    },
    stack: {
      configurable: true,
      enumerable: true,
      // stack is getter
    },
    cause: {
      configurable: true,
      enumerable: true,
      writable: true,
    },
  });

  if ('cause' in error && typeof error.cause === 'object') {
    Object.defineProperties(error.cause, {
      message: {
        configurable: true,
        enumerable: true,
        writable: true,
      },
      stack: {
        configurable: true,
        enumerable: true,
        // stack is getter
      },
    });
  }
}
