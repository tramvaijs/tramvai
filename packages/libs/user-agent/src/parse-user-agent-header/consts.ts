import { UAParser } from 'ua-parser-js';

export const uaParserExtensions = [
  /*
      We add separate regexps for Google bots, etc.
      this will allow them to get a separate browser name and process it in a special way.
      https://github.com/faisalman/ua-parser-js/issues/227
    */

  // google page preloading agent
  [/developers\.google\.com\/\+\/web\/snippet/i],
  [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION, ['type', 'bot']],

  // google, bing, msn
  [/((?:\S+)bot(?:-[imagevdo]{5})?)\/([\w.]+)/i],
  [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION, ['type', 'bot']],

  // google adsbot под видом обычного браузера
  [/[\s;(](adsbot[-\w]*?[\s;)])/i],
  [UAParser.BROWSER.NAME, [UAParser.BROWSER.VERSION, 'unknown'], ['type', 'bot']],

  /*
      adding regexps for browsers that try to appear like other browsers
      for example, ua-parser-js Firefox Focus for ios considers it just Firefox, which breaks version checks
    */
  // Firefox for iOS
  [/fxios\/([\w\\.-]+)/i],
  [[UAParser.BROWSER.NAME, 'Firefox Focus'], UAParser.BROWSER.VERSION],
];
