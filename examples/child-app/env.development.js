module.exports = {
  LOG_ENABLE: 'info:server,child-app.*',
  LOG_LEVEL: 'info',
  ASSETS_PREFIX: 'static',
  CHILD_APP_EXTERNAL_URL: 'http://localhost:4040/',
  CHILD_APP_TEST_ISOLATE_DI: process.env.CHILD_APP_TEST_ISOLATE_DI === 'true' ? 'true' : undefined,
};
