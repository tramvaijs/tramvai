module.exports = {
  PORT: '3000',
  APP_ID: 'i18n',
  ASSETS_PREFIX: 'static',
  LOG_LEVEL: 'warn',
  LOG_ENABLE: 'info:i18n*,info:route*',
  // I18n routing strategy: 'prefix_except_default' | 'prefix' | 'prefix_and_default' | 'no_prefix'
  I18N_ROUTING_STRATEGY: process.env.I18N_ROUTING_STRATEGY || 'prefix_except_default',
  // I18n update strategy: 'reload' | 'update'
  I18N_UPDATE_STRATEGY: process.env.I18N_UPDATE_STRATEGY || 'reload',
  // Default language
  I18N_DEFAULT_LANGUAGE: process.env.I18N_DEFAULT_LANGUAGE || 'ru',
  // Available languages (comma-separated)
  I18N_AVAILABLE_LANGUAGES: process.env.I18N_AVAILABLE_LANGUAGES || 'ru,en',
};
