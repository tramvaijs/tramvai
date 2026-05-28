import { isBrowserSatisfiesRequirements } from '../is-browser-satisfies-requirements';

// Source of UA - https://whatmyuseragent.com/
const bots = [
  // Google Bot
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://google.com)',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36 Google-PageRenderer Google (+https://developers.google.com/+/web/snippet/)',
  'Googlebot-Image/1.0',
  'Googlebot-Video/1.0',
  'Mozilla/5.0 (Linux; Android 5.0; SM-G920A) AppleWebKit (KHTML, like Gecko) Chrome Mobile Safari (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)',
  // Bing Bot
  'Mozilla/5.0 (compatible; bingbot/2.0; +http://bing.com)',
  // YandexBot
  'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com)',
  // GPTBot
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.0; +https://openai.com)',
  // Anthropic-ai
  'Mozilla/5.0 (compatible; Anthropic-ai/1.0; +https://anthropic.com)',
  // PerplexityBot
  'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai)',
  // TwitterBot
  'Twitterbot/1.0',
  // Facebook
  'facebookexternalhit/1.1 (+http://facebook.com)',
];

const unknown = [
  // fake ua
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 135.0.0.22.118 (iPhone10,5; iOS 13_3_1; ru_RU; ru-RU; scale=2.61; 1080x1920; 206072690)',
  'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1101.212 YaBrowser/1.5.1101.212 Safari/537.4',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/8.1.3 Mobile/15E148 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  'Mozilla/5.0 (Linux; Android 9; SM-A505FN Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.149 Mobile Safari/537.36 Instagram 134.0.0.26.121 Android (28/9; 420dpi; 1080x2131; samsung; SM-A505FN; a50; exynos9610; ru_RU; 205280538)',
  'Mozilla/5.0 (Linux; Android 9; CPH1923 Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/71.0.3578.99 Mobile Safari/537.36 YandexSearch/7.80 YandexSearchBrowser/7.80',
  // no version
  'Mozilla/5.0 (Windows NT 4.54; x64) Gecko/20100101 Firefox',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/8.1.3 Mobile/15E148 Safari/605.1.15',
  // xss
  "<script>alert(' X S S ed')</script>",
  // invalid ua
  'Mozilla/666',
  // short
  'bot/',
];

const supported = [
  // chrome 120
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  // mobile chrome 147
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36',
  // firefox 146
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0',
  // mobile firefox 141
  'Mozilla/5.0 (Android 15; Mobile; rv:141.0.3) Gecko/141.0.3 Firefox/141.0.3',
  // safari 17
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
  // mobile safari 26
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1',
  // opera 120
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.43 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0',
  // opera mobile 120
  'Mozilla/5.0 (Linux; Android 13; SM-G986U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.5938.154 Mobile Safari/537.36 OPR/120.0.6099.43',
  // edge 140
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0 OneOutlook/1.2026.317.100',
  // yabro 26
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.7680.34 YaBrowser/26.4.5.34.00 (alpha) Safari/537.36',
  // samsung 29
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/29.0 Chrome/136.0.0.0 Mobile Safari/537.36',
  // uc 17
  'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X; zh-CN) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23B85 UCBrowser/17.0.9.2442 Mobile AliApp(TUnionSDK/0.1.20.4)',
];

const supportedForce = [
  // uc 13
  'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.6610.112 Mobile Safari/537.36 UCBrowser/13.0.1542.91',
  // samsung 15
  'Mozilla/5.0 (Linux; Android 12; SAMSUNG SM-A035F/A035FXXU2BVI8) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/15.0 Chrome/90.0.4430.210 Mobile Safari/537.36',
  // opera mobile 63
  'Mozilla/5.0 (Linux; U; Android 9; itel W6004 Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/79.0.3945.116 Mobile Safari/537.36 OPR/63.0.2254.62069',
];

const notSupported = [
  // chrome 83
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
  // mobile chrome 85
  'Mozilla/5.0 (Linux; Android 9; SM-A305YN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36',
  // firefox 111
  'Mozilla/5.0 (Windows NT 6.2; rv:109.0) Gecko/20100101 Firefox/111.0',
  // mobile firefox 110
  'Mozilla/5.0 (Android 16; Mobile; rv:109.0) Gecko/110.0 Firefox/110.0',
  // safari 14
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
  // mobile safari 14
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  // opera 70
  'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.174 Safari/537.36 OPR/70.0.3728.29',
  // opera mobile 62
  'Mozilla/5.0 (Linux; U; Android 9; TECNO CC6 Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/94.0.4606.61 Mobile Safari/537.36 OPR/60.0.2254.59405',
  // edge 84
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36 Edg/84.0.522.44',
  // yabro 20
  'Mozilla/5.0 (Linux; x86_64; Android 8.1.0; sp9853i_1h10_vmm) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.6.3.54.01 Safari/537.36',
  // samsung 14
  'Mozilla/5.0 (Linux; Android 12; SAMSUNG SM-A115M) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36',
  // uc 12
  'Mozilla/5.0 (Linux; U; Android 13; en-US; CPH2159 Build/TP1A.220905.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/148.0.7778.178 UCBrowser/12.12.10.1228 Mobile Safari/537.36',
];

const uaDatasets = {
  bots,
  unknown,
  supported,
  supportedForce,
  notSupported,
};

function testDataset(
  uaDataset: string[],
  expected: boolean | null,
  browsersListConfig?: any,
  forceMinimumUnknownVersions?: boolean
) {
  uaDataset.forEach((ua, i) => {
    it(`${ua}`, () => {
      try {
        expect(
          isBrowserSatisfiesRequirements(ua, browsersListConfig, { forceMinimumUnknownVersions })
        ).toBe(expected);
      } catch (e: any) {
        if (expected === null) {
          throw new Error(`Expected user agent ${ua} to be unknown`);
        }

        throw new Error(
          `Expected user agent ${ua} to be ${expected ? 'supported' : 'not supported'}`
        );
      }
    });
  });
}

describe('user-agent/isBrowserSatisfiesRequirements', () => {
  describe('default options from @tinkoff/browserslist-config', () => {
    describe('Bots ua', () => {
      testDataset(uaDatasets.bots, null);
    });

    describe('Unknown ua', () => {
      testDataset(uaDatasets.unknown, null);
    });

    describe('Supported ua', () => {
      testDataset(uaDatasets.supported, true);
    });

    describe('Supported ua with force minimum unknown versions', () => {
      testDataset(uaDatasets.supportedForce, true, undefined, true);
    });

    describe('Not supported ua', () => {
      testDataset(uaDatasets.notSupported, false);
    });
  });
});
