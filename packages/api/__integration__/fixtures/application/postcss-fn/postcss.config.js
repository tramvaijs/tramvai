/** @type {import('postcss-load-config').ConfigFn} */
const configFn = () => ({
  plugins: {
    autoprefixer: {},
  },
});

module.exports = configFn;
