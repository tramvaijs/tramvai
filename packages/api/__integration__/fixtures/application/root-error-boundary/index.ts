if (typeof window === 'undefined') {
  // eslint-disable-next-line import/extensions, import/no-unresolved
  const RootErrorBoundary = require('@/__private__/error');

  console.log(RootErrorBoundary);
}
