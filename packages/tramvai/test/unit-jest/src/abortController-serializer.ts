module.exports = {
  test(value: unknown) {
    return value instanceof AbortSignal;
  },
  print(value: unknown) {
    return 'AbortSignal {}';
  },
};
