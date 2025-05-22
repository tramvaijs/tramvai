import { DeviceType } from '../../constants';
import { UserAgent } from '../../types';
import { getMobileOs } from '../../utils/getMobileOs';
import { BACKWARD_COMPATIBILITY_ARCH } from '../constants';
import { getBackwardCompatibleOsName } from '../utils/getBackwardCompatibleOsName';
import { parseBrowserFromString } from '../utils/parseBrowserFromString';
import { parseQuotedString } from '../utils/parseQuotedString';
import { ClientHintsHeaders } from './consts';

/**
 *
 * @description
 *
 * Some of the data are available only when additional headers for client-hints were sent from server:
 * - full browser version (only major version is available by default)
 * - OS version
 * - CPU architecture
 * - device model
 *
 * To be able to use data you should first provide header `Accept-CH` with the list of headers that client should send.
 *
 * @param headers
 * @returns
 */
export const parseClientHintsHeaders = (
  headers: Record<string, string | string[] | undefined>
): UserAgent => {
  const { browser, engine } = parseBrowserFromString(
    (headers[ClientHintsHeaders.FULL_VERSION_LIST] as string) ||
      (headers[ClientHintsHeaders.BASE] as string)
  );
  const osName = parseQuotedString(headers[ClientHintsHeaders.PLATFORM] as string);

  const mobileOS = getMobileOs(osName);
  const architecture = parseQuotedString(headers[ClientHintsHeaders.ARCH] as string);

  return {
    browser,
    engine,
    os: {
      name: getBackwardCompatibleOsName(osName),
      version: parseQuotedString(headers[ClientHintsHeaders.PLATFORM_VERSION] as string),
    },
    cpu: {
      architecture: architecture
        ? (BACKWARD_COMPATIBILITY_ARCH[architecture] ?? architecture)
        : architecture,
    },
    mobileOS,
    device: {
      model: parseQuotedString(headers[ClientHintsHeaders.MODEL] as string),
      type: headers[ClientHintsHeaders.MOBILE] === '?1' ? DeviceType.mobile : DeviceType.desktop,
      vendor: undefined,
    },
    // basically all the browsers with client-hints support
    // also compatible with SameSite=None
    sameSiteNoneCompatible: true,
  };
};
