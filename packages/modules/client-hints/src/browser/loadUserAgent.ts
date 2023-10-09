import type { UserAgent } from '@tinkoff/user-agent';
import { parseClientHintsUserAgentData, parse } from '@tinkoff/user-agent';

const getFromUserAgentData = (): UserAgent | null => {
  try {
    const values = window.__TRAMVAI_USER_AGENT_DATA ?? window.navigator.userAgentData;

    if (values === undefined) {
      return null;
    }

    // chrome User-Agent emulation doesn't sync with `navigator.userAgentData`,
    // and `navigator.userAgentData` return incorrect object for Safari User-Agents instead of `undefined`
    // example of this problem with Playwright tests - https://github.com/microsoft/playwright/issues/14361
    if (values.brands && values.brands.length === 0 && values.platform === '') {
      return null;
    }

    return parseClientHintsUserAgentData(values);
  } catch (error) {
    return null;
  }
};

export function loadUserAgent(): UserAgent {
  const fromUserAgentData = getFromUserAgentData();

  return fromUserAgentData ?? parse(navigator.userAgent);
}
