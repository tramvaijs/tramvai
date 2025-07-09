const { getCustomEslintPlugin } = require('@tinkoff/eslint-plugin-tramvai');

const { configs } = getCustomEslintPlugin(__dirname);

module.exports = { ...configs.compat };
