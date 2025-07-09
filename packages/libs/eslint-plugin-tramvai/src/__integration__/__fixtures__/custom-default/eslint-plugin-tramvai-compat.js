const { getCustomEslintPlugin } = require('@tinkoff/eslint-plugin-tramvai');

export const {
  configs: { compat },
} = getCustomEslintPlugin(__dirname);

module.exports = compat;
