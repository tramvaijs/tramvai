module.exports = {
  rules: {
    'bundle-chunk-name': require('./rules/bundle-chunk-name').rule,
    'no-lambda-fn-in-action': require('./rules/no-lambda-fn-in-actions').rule,
    'no-empty-image-sizes-attribute': require('./rules/no-empty-image-sizes-attribute').rule,
  },
  configs: {
    recommended: {
      plugins: ['@tinkoff/tramvai'],
      rules: {
        '@tinkoff/tramvai/bundle-chunk-name': 'error',
        '@tinkoff/tramvai/no-lambda-fn-in-action': 'error',
        '@tinkoff/tramvai/no-empty-image-sizes-attribute': 'warn',
        'spaced-comment': 'off',
      },
    },
  },
};
