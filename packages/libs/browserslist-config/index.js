// хотелось бы сделать в таком виде https://github.com/browserslist/browserslist#configuring-for-different-environments
// т.е. разные конфиги для разных env
// но browserslist пока такое не поддерживает для пакетов-конфигураций
// https://github.com/browserslist/browserslist/issues/300

const defaults = [
  // desktop
  'Chrome >= 49',
  'Safari >= 11',
  'Firefox >= 52',
  'Opera >= 62',
  'Edge >= 18',
  // mobile
  'ChromeAndroid >= 40',
  'ios_saf >= 10',
  'OperaMobile >= 48',
  'FirefoxAndroid >= 68',
  'Samsung >= 2',
  'Android >= 5',
  'UCAndroid >= 11',
];

// https://philipwalton.com/articles/deploying-es2015-code-in-production-today/
const modern = [
  // desktop
  'Chrome >= 61',
  'Safari >= 12',
  'Firefox >= 60',
  'Opera >= 62',
  'Edge >= 79',
  // mobile
  'ChromeAndroid >= 61',
  'ios_saf >= 12',
  'OperaMobile >= 73',
  'FirefoxAndroid >= 68',
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
