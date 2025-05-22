import { parseUserAgentHeader as parse } from '../../parse-user-agent-header/parseUserAgentHeader';
import { parseClientHintsUserAgentData } from './parseClientHintsUserAgentData';

describe('low entropy UADataValues only', () => {
  it('desktop chrome', () => {
    const result = parseClientHintsUserAgentData({
      brands: [
        {
          brand: 'Not.A/Brand',
          version: '8',
        },
        {
          brand: 'Chromium',
          version: '114',
        },
        {
          brand: 'Google Chrome',
          version: '114',
        },
      ],
      mobile: false,
      platform: 'macOS',
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "114",
          "name": "chrome",
          "version": "114",
        },
        "cpu": {
          "architecture": undefined,
        },
        "device": {
          "model": undefined,
          "type": "desktop",
          "vendor": undefined,
        },
        "engine": {
          "name": "Blink",
          "version": "114",
        },
        "mobileOS": undefined,
        "os": {
          "name": "Mac OS",
          "version": undefined,
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });

  it('mobile chrome', () => {
    const result = parseClientHintsUserAgentData({
      brands: [
        {
          brand: 'Not.A/Brand',
          version: '8',
        },
        {
          brand: 'Chromium',
          version: '114',
        },
        {
          brand: 'Google Chrome',
          version: '114',
        },
      ],
      mobile: true,
      platform: 'Android',
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "114",
          "name": "chrome",
          "version": "114",
        },
        "cpu": {
          "architecture": undefined,
        },
        "device": {
          "model": undefined,
          "type": "mobile",
          "vendor": undefined,
        },
        "engine": {
          "name": "Blink",
          "version": "114",
        },
        "mobileOS": "android",
        "os": {
          "name": "Android",
          "version": undefined,
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });

  it('desktop edge', () => {
    const result = parseClientHintsUserAgentData({
      brands: [
        {
          brand: 'Not.A/Brand',
          version: '8',
        },
        {
          brand: 'Chromium',
          version: '114',
        },
        {
          brand: 'Microsoft Edge',
          version: '114',
        },
      ],
      mobile: false,
      platform: 'Windows',
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "114",
          "name": "edge",
          "version": "114",
        },
        "cpu": {
          "architecture": undefined,
        },
        "device": {
          "model": undefined,
          "type": "desktop",
          "vendor": undefined,
        },
        "engine": {
          "name": "Blink",
          "version": "114",
        },
        "mobileOS": undefined,
        "os": {
          "name": "Windows",
          "version": undefined,
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });

  it('mobile edge', () => {
    const result = parseClientHintsUserAgentData({
      brands: [
        {
          brand: 'Not.A/Brand',
          version: '8',
        },
        {
          brand: 'Chromium',
          version: '114',
        },
        {
          brand: 'Microsoft Edge',
          version: '114',
        },
      ],
      mobile: true,
      platform: 'Android',
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "114",
          "name": "edge",
          "version": "114",
        },
        "cpu": {
          "architecture": undefined,
        },
        "device": {
          "model": undefined,
          "type": "mobile",
          "vendor": undefined,
        },
        "engine": {
          "name": "Blink",
          "version": "114",
        },
        "mobileOS": "android",
        "os": {
          "name": "Android",
          "version": undefined,
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });
});

describe('high entropy UADataValues only', () => {
  it('desktop chrome', () => {
    const result = parseClientHintsUserAgentData({
      architecture: 'arm',
      bitness: '64',
      brands: [
        {
          brand: 'Not.A/Brand',
          version: '8',
        },
        {
          brand: 'Chromium',
          version: '114',
        },
        {
          brand: 'Google Chrome',
          version: '114',
        },
      ],
      fullVersionList: [
        {
          brand: 'Not.A/Brand',
          version: '8.0.0.0',
        },
        {
          brand: 'Chromium',
          version: '114.0.5735.198',
        },
        {
          brand: 'Google Chrome',
          version: '114.0.5735.198',
        },
      ],
      mobile: false,
      model: '',
      platform: 'macOS',
      platformVersion: '13.2.1',
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "114",
          "name": "chrome",
          "version": "114.0.5735.198",
        },
        "cpu": {
          "architecture": "arm",
        },
        "device": {
          "model": "",
          "type": "desktop",
          "vendor": undefined,
        },
        "engine": {
          "name": "Blink",
          "version": "114.0.5735.198",
        },
        "mobileOS": undefined,
        "os": {
          "name": "Mac OS",
          "version": "13.2.1",
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });

  it('mobile chrome', () => {
    const result = parseClientHintsUserAgentData({
      architecture: '',
      brands: [
        {
          brand: 'Not.A/Brand',
          version: '8',
        },
        {
          brand: 'Chromium',
          version: '114',
        },
        {
          brand: 'Google Chrome',
          version: '114',
        },
      ],
      fullVersionList: [
        {
          brand: 'Not.A/Brand',
          version: '8.0.0.0',
        },
        {
          brand: 'Chromium',
          version: '114.0.5735.198',
        },
        {
          brand: 'Google Chrome',
          version: '114.0.5735.198',
        },
      ],
      mobile: true,
      model: 'SM-G955U',
      platform: 'Android',
      platformVersion: '8.0.0',
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "114",
          "name": "chrome",
          "version": "114.0.5735.198",
        },
        "cpu": {
          "architecture": "",
        },
        "device": {
          "model": "SM-G955U",
          "type": "mobile",
          "vendor": undefined,
        },
        "engine": {
          "name": "Blink",
          "version": "114.0.5735.198",
        },
        "mobileOS": "android",
        "os": {
          "name": "Android",
          "version": "8.0.0",
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });

  it('desktop edge', () => {
    const result = parseClientHintsUserAgentData({
      architecture: 'x86',
      brands: [
        {
          brand: 'Not.A/Brand',
          version: '8',
        },
        {
          brand: 'Chromium',
          version: '114',
        },
        {
          brand: 'Microsoft Edge',
          version: '114',
        },
      ],
      fullVersionList: [
        {
          brand: 'Not.A/Brand',
          version: '8.0.0.0',
        },
        {
          brand: 'Chromium',
          version: '114.0.5735.134',
        },
        {
          brand: 'Microsoft Edge',
          version: '114.0.1823.58',
        },
      ],
      mobile: false,
      model: '',
      platform: 'Windows',
      platformVersion: '10.0.0',
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "114",
          "name": "edge",
          "version": "114.0.1823.58",
        },
        "cpu": {
          "architecture": "amd64",
        },
        "device": {
          "model": "",
          "type": "desktop",
          "vendor": undefined,
        },
        "engine": {
          "name": "Blink",
          "version": "114.0.5735.134",
        },
        "mobileOS": undefined,
        "os": {
          "name": "Windows",
          "version": "10.0.0",
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });

  it('mobile edge', () => {
    const result = parseClientHintsUserAgentData({
      architecture: '',
      brands: [
        {
          brand: 'Not.A/Brand',
          version: '8',
        },
        {
          brand: 'Chromium',
          version: '114',
        },
        {
          brand: 'Microsoft Edge',
          version: '114',
        },
      ],
      fullVersionList: [
        {
          brand: 'Not.A/Brand',
          version: '8.0.0.0',
        },
        {
          brand: 'Chromium',
          version: '114.0.5735.134',
        },
        {
          brand: 'Microsoft Edge',
          version: '114.0.1823.58',
        },
      ],
      mobile: true,
      model: 'Pixel 5',
      platform: 'Android',
      platformVersion: '11',
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "114",
          "name": "edge",
          "version": "114.0.1823.58",
        },
        "cpu": {
          "architecture": "",
        },
        "device": {
          "model": "Pixel 5",
          "type": "mobile",
          "vendor": undefined,
        },
        "engine": {
          "name": "Blink",
          "version": "114.0.5735.134",
        },
        "mobileOS": "android",
        "os": {
          "name": "Android",
          "version": "11",
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });
});

describe('difference between ua-string and ua-data', () => {
  it('should not have difference in Microsoft Edge (Windows)', () => {
    const uaString = parse(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0'
    );
    const uaData = parseClientHintsUserAgentData({
      architecture: 'x86',
      bitness: '64',
      brands: [
        {
          brand: 'Microsoft Edge',
          version: '119',
        },
        {
          brand: 'Chromium',
          version: '119',
        },
        {
          brand: 'Not?A_Brand',
          version: '24',
        },
      ],
      fullVersionList: [
        {
          brand: 'Microsoft Edge',
          version: '119.0.2151.58',
        },
        {
          brand: 'Chromium',
          version: '119.0.6045.123',
        },
        {
          brand: 'Not?A_Brand',
          version: '24.0.0.0',
        },
      ],
      mobile: false,
      model: '',
      platform: 'Windows',
      platformVersion: '10.0.0',
    });

    expect(uaString.cpu).toEqual(uaData.cpu);
    expect(uaString.browser.name).toEqual(uaData.browser.name);
    expect(uaString.browser.browserEngine).toEqual(uaData.browser.browserEngine);
    expect(uaString.engine.name).toEqual(uaData.engine.name);
    expect(uaString.mobileOS).toEqual(uaData.mobileOS);
    expect(uaString.os.name).toEqual(uaData.os.name);
    expect(uaString.sameSiteNoneCompatible).toEqual(uaData.sameSiteNoneCompatible);
  });

  it('should not have difference in Chrome (macOS)', () => {
    const uaString = parse(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
    );
    const uaData = parseClientHintsUserAgentData({
      architecture: 'arm',
      bitness: '64',
      brands: [
        {
          brand: 'Chromium',
          version: '118',
        },
        {
          brand: 'Google Chrome',
          version: '118',
        },
        {
          brand: 'Not=A?Brand',
          version: '99',
        },
      ],
      fullVersionList: [
        {
          brand: 'Chromium',
          version: '118.0.5993.117',
        },
        {
          brand: 'Google Chrome',
          version: '118.0.5993.117',
        },
        {
          brand: 'Not=A?Brand',
          version: '99.0.0.0',
        },
      ],
      mobile: false,
      model: '',
      platform: 'macOS',
      platformVersion: '13.5.1',
    });

    // This different is correct, due to provide arch is better than not
    expect(uaString.cpu.architecture).toEqual(undefined);
    expect(uaData.cpu.architecture).toEqual('arm');

    expect(uaString.browser.name).toEqual(uaData.browser.name);
    expect(uaString.browser.browserEngine).toEqual(uaData.browser.browserEngine);
    expect(uaString.engine.name).toEqual(uaData.engine.name);
    expect(uaString.mobileOS).toEqual(uaData.mobileOS);
    expect(uaString.os.name).toEqual(uaData.os.name);
    expect(uaString.sameSiteNoneCompatible).toEqual(uaData.sameSiteNoneCompatible);
  });

  it('should not have difference in Opera (macOS)', () => {
    const uaString = parse(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0 (Edition Yx 05)'
    );
    const uaData = parseClientHintsUserAgentData({
      architecture: 'arm',
      bitness: '64',
      brands: [
        {
          brand: 'Opera',
          version: '105',
        },
        {
          brand: 'Chromium',
          version: '119',
        },
        {
          brand: 'Not?A_Brand',
          version: '24',
        },
      ],
      fullVersionList: [
        {
          brand: 'Opera',
          version: '105.0.4970.13',
        },
        {
          brand: 'Chromium',
          version: '119.0.6045.124',
        },
        {
          brand: 'Not?A_Brand',
          version: '24.0.0.0',
        },
      ],
      mobile: false,
      model: '',
      platform: 'macOS',
      platformVersion: '13.5.1',
    });

    // This different is correct, due to provide arch is better than not
    expect(uaString.cpu.architecture).toEqual(undefined);
    expect(uaData.cpu.architecture).toEqual('arm');

    expect(uaString.browser.name).toEqual(uaData.browser.name);
    expect(uaString.browser.browserEngine).toEqual(uaData.browser.browserEngine);
    expect(uaString.engine.name).toEqual(uaData.engine.name);
    expect(uaString.mobileOS).toEqual(uaData.mobileOS);
    expect(uaString.os.name).toEqual(uaData.os.name);
    expect(uaString.sameSiteNoneCompatible).toEqual(uaData.sameSiteNoneCompatible);
  });
});
