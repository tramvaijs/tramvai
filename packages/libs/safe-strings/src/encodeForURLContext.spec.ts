import { encodeForURLContext } from './encodeForURLContext';

const blankUrl = 'about:blank';

describe('encodeForURLContext', () => {
  it('should not alter http URLs with alphanumeric characters', () => {
    expect(encodeForURLContext('http://example.com/path/to:something')).toBe(
      'http://example.com/path/to:something'
    );
  });

  it('should not alter http URLs with ports with alphanumeric characters', () => {
    expect(encodeForURLContext('http://example.com:4567/path/to:something')).toBe(
      'http://example.com:4567/path/to:something'
    );
  });

  it('should not alter https URLs with alphanumeric characters', () => {
    expect(encodeForURLContext('https://example.com')).toBe('https://example.com');
  });

  it('should not alter https URLs with ports with alphanumeric characters', () => {
    expect(encodeForURLContext('https://example.com:4567/path/to:something')).toBe(
      'https://example.com:4567/path/to:something'
    );
  });

  it('should not alter relative-path reference URLs with alphanumeric characters', () => {
    expect(encodeForURLContext('./path/to/my.json')).toBe('./path/to/my.json');
  });

  it('should not alter absolute-path reference URLs with alphanumeric characters', () => {
    expect(encodeForURLContext('/path/to/my.json')).toBe('/path/to/my.json');
  });

  it('should not alter protocol-less network-path URLs with alphanumeric characters', () => {
    expect(encodeForURLContext('//google.com/robots.txt')).toBe('//google.com/robots.txt');
  });

  it('should not alter protocol-less URLs with alphanumeric characters', () => {
    expect(encodeForURLContext('www.example.com')).toBe('www.example.com');
  });

  it('should not alter deep-link urls with alphanumeric characters', () => {
    expect(encodeForURLContext('com.braintreepayments.demo://example')).toBe(
      'com.braintreepayments.demo://example'
    );
  });

  it('should not alter mailto urls with alphanumeric characters', () => {
    expect(encodeForURLContext('mailto:test@example.com?subject=hello+world')).toBe(
      'mailto:test@example.com?subject=hello+world'
    );
  });

  it('should not alter urls with accented characters', () => {
    expect(encodeForURLContext('www.example.com/with-áccêntš')).toBe(
      'www.example.com/with-áccêntš'
    );
  });

  it('should not strip harmless unicode characters', () => {
    expect(encodeForURLContext('www.example.com/лот.рфшишкиü–')).toBe(
      'www.example.com/лот.рфшишкиü–'
    );
  });

  it(`should replace blank urls with ${blankUrl}`, () => {
    expect(encodeForURLContext('')).toBe(blankUrl);
  });

  it('should allow custom blank url', () => {
    expect(encodeForURLContext('', '/fallback')).toBe('/fallback');
  });

  it(`should replace undefined values with ${blankUrl}`, () => {
    expect(encodeForURLContext()).toBe(blankUrl);
  });

  it('should remove whitespace escape sequences', () => {
    const testCases = [
      "javascri\npt:alert('xss')",
      "javascri\rpt:alert('xss')",
      "javascri\tpt:alert('xss')",
      "javascrip\\%74t:alert('XSS')",
      'javascrip%5c%72t:alert()',
      'javascrip%5Ctt:alert()',
      'javascrip%255Ctt:alert()',
      'javascrip%25%35Ctt:alert()',
      'javascrip%25%35%43tt:alert()',
      'javascrip%25%32%35%25%33%35%25%34%33rt:alert()',
      "javascrip%255Crt:alert('%25xss')",
    ];

    testCases.forEach((url) => {
      expect(encodeForURLContext(url)).toBe(blankUrl);
    });
  });

  it('backslash prefixed attack vectors', () => {
    const attackVectors = [
      '\fjavascript:alert()',
      '\vjavascript:alert()',
      '\tjavascript:alert()',
      '\njavascript:alert()',
      '\rjavascript:alert()',
      '\u0000javascript:alert()',
      '\u0001javascript:alert()',
    ];

    attackVectors.forEach((vector) => {
      expect(encodeForURLContext(vector)).toBe(blankUrl);
    });
  });

  describe('invalid protocols', () => {
    describe.each(['javascript', 'data', 'vbscript'])('%s', (protocol) => {
      it(`should replace ${protocol} urls with ${blankUrl}`, () => {
        expect(encodeForURLContext(`${protocol}:alert(document.domain)`)).toBe(blankUrl);
      });

      it(`should allow ${protocol} urls that start with a letter prefix`, () => {
        expect(encodeForURLContext(`not_${protocol}:alert(document.domain)`)).toBe(
          `not_${protocol}:alert(document.domain)`
        );
      });

      it(`should disallow ${protocol} urls that start with non-\\w characters as a suffix for the protocol`, () => {
        expect(encodeForURLContext(`&!*${protocol}:alert(document.domain)`)).toBe(blankUrl);
      });

      it(`should disregard capitalization for ${protocol} urls`, () => {
        // upper case every other letter in protocol name
        const mixedCapitalizationProtocol = protocol
          .split('')
          .map((character, index) => {
            if (index % 2 === 0) {
              return character.toUpperCase();
            }
            return character;
          })
          .join('');

        expect(encodeForURLContext(`${mixedCapitalizationProtocol}:alert(document.domain)`)).toBe(
          blankUrl
        );
      });

      it(`should replace ${protocol} urls with ${blankUrl} when url begins with new line`, () => {
        expect(encodeForURLContext(`\n\n\n${protocol}:alert(document.domain)`)).toBe(blankUrl);
      });

      it(`should ignore invisible ctrl characters in ${protocol} urls`, () => {
        const protocolWithControlCharacters = protocol
          .split('')
          .map((character, index) => {
            if (index === 1) {
              return `${character}%EF%BB%BF%EF%BB%BF`;
            }
            if (index === 2) {
              return `${character}%e2%80%8b`;
            }
            return character;
          })
          .join('');

        expect(encodeForURLContext(`${protocolWithControlCharacters}:alert(document.domain)`)).toBe(
          blankUrl
        );
      });

      it(`should replace ${protocol} urls with ${blankUrl} when url begins with %20`, () => {
        expect(encodeForURLContext(`%20%20%20%20${protocol}:alert(document.domain)`)).toBe(
          blankUrl
        );
      });

      it(`should replace ${protocol} urls with ${blankUrl} when url begins with %20`, () => {
        expect(encodeForURLContext(`%20%20%20%20${protocol}:alert(document.domain)`)).toBe(
          blankUrl
        );
      });

      it(`should replace ${protocol} urls with ${blankUrl} when colon is %3A`, () => {
        expect(encodeForURLContext(`${protocol}%3Aalert(document.domain)`)).toBe(blankUrl);
      });

      it.each(Array.from({ length: 32 }).map((_, index) => index.toString(16).padStart(2, '0')))(
        `should replace ${protocol} urls with \\%s control character`,
        (char) => {
          expect(encodeForURLContext(`%${char}${protocol}:alert(document.domain)`)).toBe(blankUrl);
        }
      );

      it(`should replace ${protocol} urls with ${blankUrl} when ${protocol} url begins with spaces`, () => {
        expect(encodeForURLContext(`    ${protocol}:alert(document.domain)`)).toBe(blankUrl);
      });

      it(`should not replace ${protocol}: if it is not in the scheme of the URL`, () => {
        expect(encodeForURLContext(`http://example.com#${protocol}:foo`)).toBe(
          `http://example.com#${protocol}:foo`
        );
      });
    });
  });
});
