import { BrowserEngine, DeviceType, MobileOs } from './constants';

export type BrowserEngineType = (typeof BrowserEngine)[keyof typeof BrowserEngine];

export interface Browser {
  name: string | undefined;
  /**
   * With client-hints there will be only major version
   */
  version: string | undefined;
  /**
   * @deprecated use version
   */
  major: string | undefined;
  browserEngine: string; // BrowserEngine - firefox, safari, chrome, other
  /**
   * Custom ua-parser-js extension can return `type: 'bot'` for known bots User-Agent's
   */
  type?: string;
}

export interface Engine {
  name: string | undefined;
  version: string | undefined;
}

export type DeviceType = (typeof DeviceType)[keyof typeof DeviceType];
export interface Device {
  /**
   * Device type may be undefined in various cases.
   * @see https://github.com/faisalman/ua-parser-js/issues/182
   */
  type: string | undefined; // DeviceType - 'mobile', 'desktop'
  model: string | undefined; // any string from user-agent or 'sec-ch-ua-model' header
  /**
   * @deprecated This info is not provided by client-hints
   */
  vendor: string | undefined;
}

export interface OS {
  name: string | undefined;
  version: string | undefined;
}

export interface Cpu {
  architecture: string | undefined;
}

export type MobileOs = (typeof MobileOs)[keyof typeof MobileOs];

export interface UserAgent {
  browser: Browser;
  engine: Engine;
  device: Device;
  os: OS;
  cpu: Cpu;
  mobileOS?: string; // MobileOs - winphone, android, ios, blackberry
  sameSiteNoneCompatible: boolean;
}

export type UAParserExtensionSource = (RegExp[] | (string[] | string)[])[];

export type UAParserExtensionsTypes = {
  browser?: UAParserExtensionSource;
  device?: UAParserExtensionSource;
  os?: UAParserExtensionSource;
  engine?: UAParserExtensionSource;
};
