import { UAParser } from 'ua-parser-js';
import { isSameSiteNoneCompatible } from './isSameSiteNoneCompatible';
import { parseClientHintsUserAgentData } from './client-hints';

describe('isSameSiteNoneCompatible with user agent', () => {
  const negativeTestCases = {
    'Chrome 51':
      'Mozilla/5.0 doogiePIM/1.0.4.2 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.84 Safari/537.36',
    'Chrome 52 @ Win 10':
      'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36',
    'Chrome 53 @ Win 10':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2883.87 Safari/537.36',
    'Chrome 54': 'Mozilla/5.0 Chrome/54.0.2840.99 Safari/537.36',
    'Chrome 55 @ Mac':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36',
    'Chrome 56 @ Linux':
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.76 Safari/537.36',
    'Chrome 57 @ Win 7':
      'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
    'Chrome 58 @ Android':
      'Mozilla/5.0 (Linux; Android 8.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Klar/1.0 Chrome/58.0.3029.121 Mobile Safari/537.36',
    'Chrome 59 @ Win7':
      'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
    'Chrome 60 @ Win10':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36',
    'Chrome 61 @ Win10':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.79 Safari/537.36',
    'Chrome 62 @ Win10':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3165.0 Safari/537.36',
    'Chrome 63 @ Win7':
      'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3213.3 Safari/537.36',
    'Chrome 64 @ Win7':
      'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.119 Safari/537.36',
    'Chrome 65':
      'Mozilla/5.0 (Win) AppleWebKit/1000.0 (KHTML, like Gecko) Chrome/65.663 Safari/1000.01',
    'Chrome 66 @ Win10':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3334.0 Safari/537.36',
    'Chrome 66 Webview':
      'Mozilla/5.0 (Linux; Android 4.4.4; One Build/KTU84L.H4) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/28.0.0.20.16;]',
    'UC Browser @ 10.7':
      'UCWEB/2.0 (MIDP-2.0; U; Adr 4.0.4; en-US; ZTE_U795) U2/1.0.0 UCBrowser/10.7.6.805 U2/1.0.0 Mobile',
    'UC Browser 12 @ Android':
      'Mozilla/5.0 (Linux; U; Android 7.1.1; en-US; Lenovo K8 Note Build/NMB26.54-74) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.0.0.1088 Mobile Safari/537.36',
    'Safari @ Mac 10.14':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15',
    'Embeded @ Mac 10.4':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/537.36 (KHTML, like Gecko)',
    'Safari @ iOS 12':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/ 604.1.21 (KHTML, like Gecko) Version/ 12.0 Mobile/17A6278a Safari/602.1.26',
    'Chrome @ iOS 12':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/70.0.3538.75 Mobile/15E148 Safari/605.1',
    'Firefox @ iOS 12':
      'Mozilla/5.0 (iPad; CPU OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/13.2b11866 Mobile/16A366 Safari/605.1.15',
    'Chromium @ Ubuntu':
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/53.0.2785.143 Chrome/53.0.2785.143 Safari/537.36',
  };

  const positiveTestCases = {
    'UC Browser 11.5 @ iOS 11':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X; zh-CN) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/15A5304i UCBrowser/11.5.7.986 Mobile AliApp(TUnionSDK/0.1.15)',
    'Chrome 50 @ Win10':
      'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36',
    'Chrome 67 @ Win10':
      'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.2526.73 Safari/537.36',
    'Chrome 60 @ IOS':
      'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) CriOS/60.0.3112.72 Mobile/15A5327g Safari/602.1',
    'Chrome @ Mac':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.29 Safari/537.36',
    'UC Browser 12.13.2 @ Andriod':
      'Mozilla/5.0 (Linux; U; Android 8.0.0; en-US; Pixel XL Build/OPR3.170623.007) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 UCBrowser/12.13.2.1005 U3/0.8.0 Mobile Safari/534.30',
    'UC Browser 12.13.4 @ Andriod':
      'Mozilla/5.0 (Linux; U; Android 8.0.0; en-US; Pixel XL Build/OPR3.170623.007) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 UCBrowser/12.13.4.1005 U3/0.8.0 Mobile Safari/534.30',
    'Safari @ Mac 13':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15',
    'Safari @ Mac 15.5':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/601.1.39 (KHTML, like Gecko) Version/10.1.2 Safari/601.1.39',
    'Safari @ ios 13':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/66.6 Mobile/14A5297c Safari/602.1',
    'Chrome 67 @ Mac OS 10.14':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
  };

  const uaParser = new UAParser('');

  Object.entries(negativeTestCases).forEach(([browser, userAgent]) => {
    const { ua, ...result } = uaParser.setUA(userAgent).getResult();
    it(`test ${browser} (false)`, () => {
      expect(isSameSiteNoneCompatible(result)).toBe(false);
    });
  });

  Object.entries(positiveTestCases).forEach(([browser, userAgent]) => {
    it(`test ${browser} (true)`, () => {
      const { ua, ...result } = uaParser.setUA(userAgent).getResult();
      expect(isSameSiteNoneCompatible(result)).toBe(true);
    });
  });

  it('returns true, if parser data were not full', () => {
    const userAgent =
      'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36';
    const { ua, ...result } = uaParser.setUA(userAgent).getResult();
    // @ts-ignore
    result.browser = undefined;

    expect(isSameSiteNoneCompatible(result)).toBe(true);
  });
});

// In fact, all browsers with client hints support supports `isSameSiteNone` also.
// What we are checking here is that result of `const result = parseClientHintsHeaders/parseClientHintsUserAgentData`
// will be correct for `isSameSiteNoneCompatible(result)`
describe('isSameSiteNoneCompatible with client hints', () => {
  it('unsupported version of chrome', () => {
    const userAgent = parseClientHintsUserAgentData({
      brands: [
        {
          brand: 'Not.A/Brand',
          version: '8',
        },
        {
          brand: 'Chromium',
          version: '62',
        },
        {
          brand: 'Google Chrome',
          version: '62',
        },
      ],
      mobile: false,
      platform: 'macOS',
    });

    expect(isSameSiteNoneCompatible(userAgent)).toBe(false);
  });

  it('unsupported version of engine', () => {
    const userAgent = parseClientHintsUserAgentData({
      brands: [
        {
          brand: 'Not.A/Brand',
          version: '8',
        },
        {
          brand: 'Chromium',
          version: '62',
        },
        {
          brand: 'Microsoft Edge',
          version: '62',
        },
      ],
      mobile: false,
      platform: 'Windows',
    });

    expect(isSameSiteNoneCompatible(userAgent)).toBe(false);
  });
});
