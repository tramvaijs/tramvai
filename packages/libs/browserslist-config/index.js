// хотелось бы сделать в таком виде https://github.com/browserslist/browserslist#configuring-for-different-environments
// т.е. разные конфиги для разных env
// но browserslist пока такое не поддерживает для пакетов-конфигураций
// https://github.com/browserslist/browserslist/issues/300

const defaults = [
  // desktop
  'Chrome >= 80',
  'Safari >= 14.0',
  'Firefox >= 115',
  'Opera >= 67',
  'Edge >= 80',
  // mobile
  'ChromeAndroid >= 80',
  'ios_saf >= 14.0',
  'OperaMobile >= 57',
  'FirefoxAndroid >= 115',
  'Samsung >= 13',
  'UCAndroid >= 13',
];

const node = ['Node >= 18'];

module.exports = {
  defaults,
  modern: defaults,
  node,
};
