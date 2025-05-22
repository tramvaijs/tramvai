import { DeviceType } from '../../constants';
import { UserAgent } from '../../types';
import { getMobileOs } from '../../utils/getMobileOs';
import { BACKWARD_COMPATIBILITY_ARCH } from '../constants';
import { getBackwardCompatibleOsName } from '../utils/getBackwardCompatibleOsName';
import { parseBrowserFromUserAgentData } from '../utils/parseBrowserFromUserAgentData';

/**
 *
 * @description
 * Some of the data will be available if `UADataValues` were gotten from
 * `getHighEntropyValues` async method, but it's not suitable for all cases.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/User-Agent_Client_Hints_API
 * @see https://wicg.github.io/ua-client-hints/#http-ua-hints
 *
 * @param payload
 *
 * @example
 * const clientHints = parseClientHintsUserAgentData(window.navigator.userAgentData)
 */
export const parseClientHintsUserAgentData = (payload: UADataValues): UserAgent => {
  const { browser, engine } = parseBrowserFromUserAgentData(
    payload.fullVersionList || payload.brands || []
  );

  return {
    browser,
    engine,
    os: {
      name: getBackwardCompatibleOsName(payload.platform),
      version: payload.platformVersion,
    },
    cpu: {
      architecture: payload.architecture
        ? (BACKWARD_COMPATIBILITY_ARCH[payload.architecture] ?? payload.architecture)
        : payload.architecture,
    },
    mobileOS: getMobileOs(payload.platform),
    device: {
      model: payload.model,
      type: payload.mobile ? DeviceType.mobile : DeviceType.desktop,
      vendor: undefined,
    },
    // basically all the browsers with client-hints support
    // also compatible with SameSite=None
    sameSiteNoneCompatible: true,
  };
};
