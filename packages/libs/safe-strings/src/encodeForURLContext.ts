/** Mainly inspired by https://github.com/braintree/sanitize-url/tree/main */

const invalidProtocolRegex = /^([^\w]*)(javascript|data|vbscript)/im;
const urlSchemeRegex = /^.+(:)/gim;
export const whitespaceEscapeCharsRegex = /(\\|%5[cC])((%(6[eE]|72|74))|[nrt])/g;
const relativePathPrefixRegex = /^((\.\.?)|(\/)(?!\\*\/)+)/;
// eslint-disable-next-line no-control-regex
export const ctrlCharactersRegex = /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim;

export function isRelativeUrlWithoutProtocol(url: string): boolean {
  return relativePathPrefixRegex.test(url);
}

function decodeControlCharacters(str: string) {
  return str.replace(ctrlCharactersRegex, '');
}

function decodeURI(uri: string): string {
  try {
    return decodeURIComponent(uri);
  } catch (e: unknown) {
    // Ignoring error
    // It is possible that the URI contains a `%` not associated
    // with URI/URL-encoding.
    return uri;
  }
}

/**
 * Sanitize possible XSS in string for URL context
 *
 * The XSS vulnerability in navigation is related to the `javascript:` protocol in URLs, and is detailed in this article - https://aszx87410.github.io/beyond-xss/en/ch1/javascript-protocol/
 *
 * This vulnerability applies to two cases:
 * - when links are specified in the attributes of `a`, `iframe` and `form` DOM elements
 * - custom redirects using `window.location`
 *
 * The first case is handled at the framework level - with SSR and hydration, React prevents the `javascript:` protocol from being rendered in the link attributes.
 *
 * For custom redirects it is recommended to use `encodeForURLContext`.
 *
 * The code is taken from the `https://github.com/braintree/sanitize-url` library, except for the HTML entity decoding logic, so as not to duplicate the work that React already does.
 *
 * references:
 * https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
 * https://www.bomberbot.com/javascript/javascript-url-encode-example-how-to-use-encodeuricomponent-and-encodeuri/
 * https://stackoverflow.com/questions/24078332/is-it-secure-to-use-window-location-href-directly-without-validation/24089350#24089350
 * https://github.com/ihebski/XSS-Payloads
 * https://aszx87410.github.io/beyond-xss/en/ch1/javascript-protocol/
 */
export function encodeForURLContext(url?: string, blankUrl = 'about:blank') {
  if (!url) {
    return blankUrl;
  }

  let charsToDecode;
  let decodedUrl = decodeURI(url);

  do {
    decodedUrl = decodeControlCharacters(decodedUrl).replace(whitespaceEscapeCharsRegex, '').trim();

    decodedUrl = decodeURI(decodedUrl);

    charsToDecode = decodedUrl.match(whitespaceEscapeCharsRegex);
  } while (charsToDecode && charsToDecode.length > 0);

  const sanitizedUrl = decodedUrl;

  if (!sanitizedUrl) {
    return blankUrl;
  }

  if (isRelativeUrlWithoutProtocol(sanitizedUrl)) {
    return sanitizedUrl;
  }

  const urlSchemeParseResults = sanitizedUrl.match(urlSchemeRegex);

  if (!urlSchemeParseResults) {
    return sanitizedUrl;
  }

  const urlScheme = urlSchemeParseResults[0];

  if (invalidProtocolRegex.test(urlScheme)) {
    return blankUrl;
  }

  return sanitizedUrl;
}
