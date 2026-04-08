/**
 * https://webkit.org/blog/17333/webkit-features-in-safari-26-0/#update-to-ua-string
 *
 * iOS version normalization workaround for Safari ≥ 26.
 *
 * Starting from iOS 26, WebKit freezes the OS version in the User-Agent
 * string at 18.6, making it unreliable for detecting the real iOS version.
 *
 * To address this, we derive the actual iOS version from the Safari version
 * (Version/X.Y in the UA), since Safari’s major version is aligned with the
 * iOS major version (e.g., Safari 26 → iOS 26).
 *
 * This function adjusts the parsed UA result by replacing the incorrect
 * iOS version with the inferred one when necessary.
 */

import type { IBrowser, IOS } from 'ua-parser-js';

export const normalizeOSVersion = ({ os, browser }: { os: IOS; browser: IBrowser }): IOS => {
  if (browser.name?.toLowerCase() === 'mobile safari') {
    const safariVersion = parseFloat(browser.version || '0');

    if (safariVersion >= 26) {
      return {
        name: os.name,
        version: `${safariVersion}`,
      };
    }
  }

  return {
    name: os.name,
    version: os.version,
  };
};
