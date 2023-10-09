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
  browserEngine: string;
}

export interface Engine {
  name: string | undefined;
  version: string | undefined;
}

export interface Device {
  /**
   * Device type may be undefined in various cases.
   * @see https://github.com/faisalman/ua-parser-js/issues/182
   */
  type: string | undefined;
  model: string | undefined;
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

export interface UserAgent {
  browser: Browser;
  engine: Engine;
  device: Device;
  os: OS;
  cpu: Cpu;
  mobileOS?: string;
  sameSiteNoneCompatible: boolean;
}
