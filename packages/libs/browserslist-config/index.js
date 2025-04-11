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

const node = ['Node >= 18'];

module.exports = {
  defaults,
  modern: defaults,
  node,
};
