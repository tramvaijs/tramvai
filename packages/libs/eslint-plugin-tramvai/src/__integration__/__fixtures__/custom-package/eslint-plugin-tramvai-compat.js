const { getCustomEslintPlugin } = require('@tinkoff/eslint-plugin-tramvai');

// relative path is a hack for tests
export const {
  configs: { compat },
} = getCustomEslintPlugin('./custom-polyfills/package.json', __dirname);

module.exports = compat;
