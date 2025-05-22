import { ClientHintsHeaders } from './consts';
import { parseClientHintsHeaders } from './parseClientHintsHeaders';

describe('low entropy headers only', () => {
  it('desktop chrome', () => {
    expect(
      parseClientHintsHeaders({
        [ClientHintsHeaders.BASE]:
          '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
        [ClientHintsHeaders.MOBILE]: '?0',
        [ClientHintsHeaders.PLATFORM]: '"Windows"',
      })
    ).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "106",
          "name": "chrome",
          "version": "106",
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
          "version": "106",
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

  it('mobile chrome', () => {
    expect(
      parseClientHintsHeaders({
        [ClientHintsHeaders.BASE]:
          '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
        [ClientHintsHeaders.MOBILE]: '?1',
        [ClientHintsHeaders.PLATFORM]: '"Android"',
      })
    ).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "106",
          "name": "chrome",
          "version": "106",
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
          "version": "106",
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

  it('desktop vivaldi', () => {
    expect(
      parseClientHintsHeaders({
        [ClientHintsHeaders.BASE]: '"Chromium";v="104", " Not A;Brand";v="99"',
        [ClientHintsHeaders.MOBILE]: '?0',
        [ClientHintsHeaders.PLATFORM]: '"Windows"',
      })
    ).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": undefined,
          "name": "Blink",
          "version": "104",
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
          "version": "104",
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

  it('mobile vivaldi', () => {
    expect(
      parseClientHintsHeaders({
        [ClientHintsHeaders.BASE]: '"Chromium";v="104", " Not A;Brand";v="99"',
        [ClientHintsHeaders.MOBILE]: '?1',
        [ClientHintsHeaders.PLATFORM]: '"Android"',
      })
    ).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": undefined,
          "name": "Blink",
          "version": "104",
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
          "version": "104",
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
    expect(
      parseClientHintsHeaders({
        [ClientHintsHeaders.BASE]:
          '"Microsoft Edge";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
        [ClientHintsHeaders.MOBILE]: '?0',
        [ClientHintsHeaders.PLATFORM]: '"Windows"',
      })
    ).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "105",
          "name": "edge",
          "version": "105",
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
          "version": "105",
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
    expect(
      parseClientHintsHeaders({
        [ClientHintsHeaders.BASE]:
          '"Microsoft Edge";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
        [ClientHintsHeaders.MOBILE]: '?1',
        [ClientHintsHeaders.PLATFORM]: '"Android"',
      })
    ).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "105",
          "name": "edge",
          "version": "105",
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
          "version": "105",
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

describe('high entropy headers only', () => {
  it('desktop chrome', () => {
    expect(
      parseClientHintsHeaders({
        [ClientHintsHeaders.FULL_VERSION_LIST]:
          '"Not.A/Brand";v="8.0.0.0", "Chromium";v="110.0.5481.100", "Google Chrome";v="110.0.5481.100"',
        [ClientHintsHeaders.PLATFORM_VERSION]: '"10.0.19044.2364"',
        [ClientHintsHeaders.ARCH]: '"x86_64"',
        [ClientHintsHeaders.MODEL]: '"iPhone 13"',
      })
    ).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "110.0.5481.100",
          "name": "chrome",
          "version": "110.0.5481.100",
        },
        "cpu": {
          "architecture": "x86_64",
        },
        "device": {
          "model": "iPhone 13",
          "type": "desktop",
          "vendor": undefined,
        },
        "engine": {
          "name": "Blink",
          "version": "110.0.5481.100",
        },
        "mobileOS": undefined,
        "os": {
          "name": undefined,
          "version": "10.0.19044.2364",
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });
});
