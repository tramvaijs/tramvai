// хотелось бы сделать в таком виде https://github.com/browserslist/browserslist#configuring-for-different-environments
// т.е. разные конфиги для разных env
// но browserslist пока такое не поддерживает для пакетов-конфигураций
// https://github.com/browserslist/browserslist/issues/300

const defaults = [
  // desktop
  'Chrome >= 88',
  'Safari >= 15.0',
  'Firefox >= 115',
  'Opera >= 74',
  'Edge >= 88',
  // mobile
  'ChromeAndroid >= 88',
  'ios_saf >= 15.0',
  'OperaMobile >= 63',
  'FirefoxAndroid >= 115',
  'Samsung >= 15',
  'UCAndroid >= 13',
];

const node = ['Node >= 18'];

module.exports = {
  defaults,
  modern: defaults,
  node,
};
