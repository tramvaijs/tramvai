import UAParser from 'ua-parser-js';

export const BROWSERS_LIST_MAP: {
  [key: string]: {
    type: 'mobile' | 'desktop' | 'any';
    name: string;
  };
} = {
  chrome: {
    type: 'desktop',
    name: 'chrome',
  },
  safari: {
    type: 'desktop',
    name: 'safari',
  },
  firefox: {
    type: 'desktop',
    name: 'firefox',
  },
  opera: {
    type: 'desktop',
    name: 'opera',
  },
  ie: {
    type: 'desktop',
    name: 'ie',
  },
  edge: {
    type: 'any',
    name: 'edge',
  },
  and_chr: {
    type: 'mobile',
    name: 'chrome',
  },
  ios_saf: {
    type: 'mobile',
    name: 'mobile safari',
  },
  android: {
    type: 'mobile',
    name: 'android browser',
  },
  op_mob: {
    type: 'mobile',
    name: 'opera',
  },
  and_uc: {
    type: 'mobile',
    name: 'ucbrowser',
  },
  and_ff: {
    type: 'mobile',
    name: 'firefox',
  },
  samsung: {
    type: 'mobile',
    name: 'samsung browser',
  },
};

export const CHROMIUM_BASED_BROWSERS = [
  'android browser',
  'yandex',
  'blink',
  'vivaldi' /* , 'chrome webview', 'opera', 'samsung' */,
];

export const uaParserExtensions = [
  // добавляем отдельные регекспы для ботов гугла и т.п.
  // это позволит для них получить отдельное имя браузера и обработать специальным образом
  // https://github.com/faisalman/ua-parser-js/issues/227

  // google page preloading agent
  [/developers\.google\.com\/\+\/web\/snippet/i],
  [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION, ['type', 'bot']],

  // google, bing, msn
  [/((?:\S+)bot(?:-[imagevdo]{5})?)\/([\w.]+)/i],
  [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION, ['type', 'bot']],

  // google adsbot под видом обычного браузера
  [/[\s;(](adsbot[-\w]*?[\s;)])/i],
  [UAParser.BROWSER.NAME, [UAParser.BROWSER.VERSION, 'unknown'], ['type', 'bot']],

  // добавляем регекспы для браузеров которые пытаются казаться другими браузерами
  // например ua-parser-js Firefox Focus для ios считает как просто Firefox, что ломает проверки на версии

  // Firefox for iOS
  [/fxios\/([\w\\.-]+)/i],
  [[UAParser.BROWSER.NAME, 'Firefox Focus'], UAParser.BROWSER.VERSION],
];
