import UAParser from 'ua-parser-js';
import { parseUserAgentHeader } from './parseUserAgentHeader';
import { UAParserExtensionsTypes } from '../types';

describe('modern browsers', () => {
  describe('mobile safari with iOS >= 26 and iOS <= 18', () => {
    it('mobile safari iOS >= 26 (UA frozen at 18.x, should normalize to 26.x)', () => {
      const ua =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1';

      const result = parseUserAgentHeader(ua);

      expect(result.os.name).toBe('iOS');
      expect(result.os.version).toBe('26.3');
      expect(result).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "safari",
          "major": "26",
          "name": "mobile safari",
          "version": "26.3",
        },
        "cpu": {
          "architecture": undefined,
        },
        "device": {
          "model": "iPhone",
          "type": "mobile",
          "vendor": "Apple",
        },
        "engine": {
          "name": "WebKit",
          "version": "605.1.15",
        },
        "mobileOS": "ios",
        "os": {
          "name": "iOS",
          "version": "26.3",
        },
        "sameSiteNoneCompatible": true,
      }
    `);
    });

    it('mobile safari iOS <= 18 (should keep original UA version)', () => {
      const ua =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';

      const result = parseUserAgentHeader(ua);

      expect(result.os.name).toBe('iOS');
      expect(result.os.version).toBe('18.6');
      expect(result).toMatchInlineSnapshot(`
    {
      "browser": {
        "browserEngine": "safari",
        "major": "18",
        "name": "mobile safari",
        "version": "18.6",
      },
      "cpu": {
        "architecture": undefined,
      },
      "device": {
        "model": "iPhone",
        "type": "mobile",
        "vendor": "Apple",
      },
      "engine": {
        "name": "WebKit",
        "version": "605.1.15",
      },
      "mobileOS": "ios",
      "os": {
        "name": "iOS",
        "version": "18.6",
      },
      "sameSiteNoneCompatible": true,
    }
  `);
    });

    it('should not normalize non-Safari browsers on iOS (e.g. Chrome)', () => {
      const ua =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 26_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/117.0.5938.108 Mobile/15E148 Safari/604.1';

      const result = parseUserAgentHeader(ua);

      expect(result.os.name).toBe('iOS');
      expect(result.os.version).toBe('26.4');

      expect(result).toMatchInlineSnapshot(`
    {
      "browser": {
        "browserEngine": "safari",
        "major": "117",
        "name": "chrome",
        "version": "117.0.5938.108",
      },
      "cpu": {
        "architecture": undefined,
      },
      "device": {
        "model": "iPhone",
        "type": "mobile",
        "vendor": "Apple",
      },
      "engine": {
        "name": "WebKit",
        "version": "605.1.15",
      },
      "mobileOS": "ios",
      "os": {
        "name": "iOS",
        "version": "26.4",
      },
      "sameSiteNoneCompatible": true,
    }
  `);
    });

    it('should not normalize non-Safari browsers on iOS (e.g. Firefox)', () => {
      const ua =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/149.2 Mobile/15E148 Safari/604.1';

      const result = parseUserAgentHeader(ua);

      expect(result.os.name).toBe('iOS');
      expect(result.os.version).toBe('18.7');

      expect(result).toMatchInlineSnapshot(`
    {
      "browser": {
        "browserEngine": "safari",
        "major": undefined,
        "name": "firefox focus",
        "version": undefined,
      },
      "cpu": {
        "architecture": undefined,
      },
      "device": {
        "model": "iPhone",
        "type": "mobile",
        "vendor": "Apple",
      },
      "engine": {
        "name": "WebKit",
        "version": "605.1.15",
      },
      "mobileOS": "ios",
      "os": {
        "name": "iOS",
        "version": "18.7",
      },
      "sameSiteNoneCompatible": true,
    }
  `);
    });

    it('should not override if Safari version is missing', () => {
      const ua =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1';

      const result = parseUserAgentHeader(ua);

      expect(result.os.version).toBe('18.7');

      expect(result).toMatchInlineSnapshot(`
    {
      "browser": {
        "browserEngine": "safari",
        "major": undefined,
        "name": "safari",
        "version": undefined,
      },
      "cpu": {
        "architecture": undefined,
      },
      "device": {
        "model": "iPhone",
        "type": "mobile",
        "vendor": "Apple",
      },
      "engine": {
        "name": "WebKit",
        "version": "605.1.15",
      },
      "mobileOS": "ios",
      "os": {
        "name": "iOS",
        "version": "18.7",
      },
      "sameSiteNoneCompatible": true,
    }
  `);
    });
  });

  it('desktop chrome', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36';
    expect(parseUserAgentHeader(ua)).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "83",
          "name": "chrome",
          "version": "83.0.4103.61",
        },
        "cpu": {
          "architecture": undefined,
        },
        "device": {
          "model": "Macintosh",
          "type": undefined,
          "vendor": "Apple",
        },
        "engine": {
          "name": "Blink",
          "version": "83.0.4103.61",
        },
        "mobileOS": undefined,
        "os": {
          "name": "Mac OS",
          "version": "10.15.4",
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });

  it('mobile chrome', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 9) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.162 Mobile Safari/537.36 DuckDuckGo/5';
    expect(parseUserAgentHeader(ua)).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "5",
          "name": "duckduckgo",
          "version": "5",
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
          "version": "80.0.3987.162",
        },
        "mobileOS": "android",
        "os": {
          "name": "Android",
          "version": "9",
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });

  it('safari', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15';
    expect(parseUserAgentHeader(ua)).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "safari",
          "major": "13",
          "name": "safari",
          "version": "13.1",
        },
        "cpu": {
          "architecture": undefined,
        },
        "device": {
          "model": "Macintosh",
          "type": undefined,
          "vendor": "Apple",
        },
        "engine": {
          "name": "WebKit",
          "version": "605.1.15",
        },
        "mobileOS": undefined,
        "os": {
          "name": "Mac OS",
          "version": "10.15.4",
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });
});

describe('supported browsers', () => {
  it('desktop chrome', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36';
    expect(parseUserAgentHeader(ua)).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "81",
          "name": "chrome",
          "version": "81.0.4044.92",
        },
        "cpu": {
          "architecture": undefined,
        },
        "device": {
          "model": "Macintosh",
          "type": undefined,
          "vendor": "Apple",
        },
        "engine": {
          "name": "Blink",
          "version": "81.0.4044.92",
        },
        "mobileOS": undefined,
        "os": {
          "name": "Mac OS",
          "version": "10.14.5",
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });

  it('mobile chrome', () => {
    const ua =
      'Mozilla/5.0 (Linux; U; Android 5.1; zh-CN; MZ-M3s Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 MZBrowser/8.2.110-2020060117 UWS/2.15.0.4 Mobile Safari/537.360.44';
    expect(parseUserAgentHeader(ua)).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "4",
          "name": "android browser",
          "version": "4.0",
        },
        "cpu": {
          "architecture": undefined,
        },
        "device": {
          "model": "M3s",
          "type": "mobile",
          "vendor": "Meizu",
        },
        "engine": {
          "name": "Blink",
          "version": "57.0.2987.108",
        },
        "mobileOS": "android",
        "os": {
          "name": "Android",
          "version": "5.1",
        },
        "sameSiteNoneCompatible": false,
      }
    `);
  });

  it('desktop safari', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Safari/605.1.22';
    expect(parseUserAgentHeader(ua)).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "safari",
          "major": "13",
          "name": "safari",
          "version": "13.0.5",
        },
        "cpu": {
          "architecture": undefined,
        },
        "device": {
          "model": "Macintosh",
          "type": undefined,
          "vendor": "Apple",
        },
        "engine": {
          "name": "WebKit",
          "version": "605.1.15",
        },
        "mobileOS": undefined,
        "os": {
          "name": "Mac OS",
          "version": "10.15.3",
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });

  it('mobile safari', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.7';
    expect(parseUserAgentHeader(ua)).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "safari",
          "major": "13",
          "name": "mobile safari",
          "version": "13.1",
        },
        "cpu": {
          "architecture": undefined,
        },
        "device": {
          "model": "iPhone",
          "type": "mobile",
          "vendor": "Apple",
        },
        "engine": {
          "name": "WebKit",
          "version": "605.1.15",
        },
        "mobileOS": "ios",
        "os": {
          "name": "iOS",
          "version": "13.4",
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });

  it('mobile opera', () => {
    const ua =
      'Opera/9.80 (Android 2.3.5; Linux; Opera Mobi/ADR-1111101157; U; de) Presto/2.9.201 Version/11.50';
    expect(parseUserAgentHeader(ua)).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "other",
          "major": "11",
          "name": "opera mobi",
          "version": "11.50",
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
          "name": "Presto",
          "version": "2.9.201",
        },
        "mobileOS": "android",
        "os": {
          "name": "Android",
          "version": "2.3.5",
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });

  it('mobile samsung', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 9; LM-X220) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36';
    expect(parseUserAgentHeader(ua)).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "chrome",
          "major": "23",
          "name": "samsung browser",
          "version": "23.0",
        },
        "cpu": {
          "architecture": undefined,
        },
        "device": {
          "model": "LM-X220",
          "type": "mobile",
          "vendor": "LG",
        },
        "engine": {
          "name": "Blink",
          "version": "115.0.0.0",
        },
        "mobileOS": "android",
        "os": {
          "name": "Android",
          "version": "9",
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });
});

describe('mobile devices', () => {
  it('winphone', () => {
    const ua =
      'Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; Microsoft; Lumia 535 Dual SIM) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Mobile Safari/537.36 Edge/14.14393';
    expect(parseUserAgentHeader(ua)).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "other",
          "major": "14",
          "name": "edge",
          "version": "14.14393",
        },
        "cpu": {
          "architecture": undefined,
        },
        "device": {
          "model": "Lumia 535 Dual SIM",
          "type": "mobile",
          "vendor": "Microsoft",
        },
        "engine": {
          "name": "EdgeHTML",
          "version": "14.14393",
        },
        "mobileOS": "winphone",
        "os": {
          "name": "Windows Phone",
          "version": "10.0",
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });
});

describe('extensions', () => {
  it('extension', () => {
    const ua = 'iPhone/iOS(18.5)/MB/7.11.1(7111000)';
    const extension: UAParserExtensionsTypes[] = [
      {
        browser: [[/(MB)\/([^/]+)$/i], [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION]],
      },
      {
        device: [
          [/^([^/]+)\/([^/]+)\/MB\/([^/]+)$/],
          [UAParser.DEVICE.MODEL, [UAParser.DEVICE.TYPE, UAParser.DEVICE.MOBILE]],
        ],
        os: [
          [/(iOS)([^/]+)\/MB\/([^/]+)$/],
          [UAParser.OS.NAME, UAParser.OS.VERSION],
          [/(Android)([^/]+)\/MB\/([^/]+)$/],
          [UAParser.OS.NAME, UAParser.OS.VERSION],
        ],
      },
    ];
    expect(parseUserAgentHeader(ua, extension)).toMatchInlineSnapshot(`
      {
        "browser": {
          "browserEngine": "other",
          "major": "7",
          "name": "mb",
          "version": "7.11.1(7111000)",
        },
        "cpu": {
          "architecture": undefined,
        },
        "device": {
          "model": "iPhone",
          "type": "mobile",
          "vendor": undefined,
        },
        "engine": {
          "name": undefined,
          "version": undefined,
        },
        "mobileOS": "ios",
        "os": {
          "name": "iOS",
          "version": "(18.5)",
        },
        "sameSiteNoneCompatible": true,
      }
    `);
  });
});
