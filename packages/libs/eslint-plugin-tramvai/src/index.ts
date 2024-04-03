module.exports = {
  rules: {
    'bundle-chunk-name': require('./rules/bundle-chunk-name').rule,
    'no-lambda-fn-in-action': require('./rules/no-lambda-fn-in-actions').rule,
  },
  configs: {
    recommended: {
      plugins: ['@tinkoff/tramvai'],
      rules: {
        '@tinkoff/tramvai/bundle-chunk-name': 'error',
        '@tinkoff/tramvai/no-lambda-fn-in-action': 'error',
        'spaced-comment': 'off',
      },
    },
  },
};
