// хотелось бы сделать в таком виде https://github.com/browserslist/browserslist#configuring-for-different-environments
// т.е. разные конфиги для разных env
// но browserslist пока такое не поддерживает для пакетов-конфигураций
// https://github.com/browserslist/browserslist/issues/300

const defaults = [
  // desktop
  'Chrome >= 59',
  'Safari >= 12.1',
  'Firefox >= 115',
  'Opera >= 62',
  'Edge >= 79',
  // mobile
  'ChromeAndroid >= 59',
  'ios_saf >= 12.1',
  'OperaMobile >= 48',
  'FirefoxAndroid >= 119',
  'Samsung >= 7',
  'UCAndroid >= 13',
];

// https://philipwalton.com/articles/deploying-es2015-code-in-production-today/
const modern = [
  // desktop
  'Chrome >= 61',
  'Safari >= 12.1',
  'Firefox >= 115',
  'Opera >= 62',
  'Edge >= 79',
  // mobile
  'ChromeAndroid >= 61',
  'ios_saf >= 12.1',
  'OperaMobile >= 73',
  'FirefoxAndroid >= 119',
  'Samsung >= 8.2',
];

// TODO: replace but more sane version based on TCORE-4597 investigation
const node = ['Node >= 14'];

module.exports = {
  defaults,
  legacy: defaults,
  modern,
  node,
};
