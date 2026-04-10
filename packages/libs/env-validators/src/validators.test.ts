import {
  combineValidators,
  isUrl,
  isNumber,
  isTrue,
  isFalse,
  isOneOf,
  startsWith,
  endsWith,
  isArrayUrl,
} from './validators';

describe('validators', () => {
  it('isUrl', () => {
    expect(isUrl('https://google.com')).toEqual(false);
    expect(isUrl('/foo/bar')).toEqual(false);
    expect(isUrl('file://google.com')).toEqual('Invalid protocol file://google.com/');
    expect(isUrl('not valid url')).toEqual('URL not valid url is not valid');
  });
  it('isNumber', () => {
    expect(isNumber('5')).toEqual(true);
    expect(isNumber('55+5')).toEqual('value is not a number');
  });
  it('isTrue', () => {
    expect(isTrue('true')).toEqual(true);
    expect(isTrue('false')).toEqual('value is not a true');
  });
  it('isFalse', () => {
    expect(isFalse('false')).toEqual(true);
    expect(isFalse('true')).toEqual('value is not a false');
  });
  it('isOneOf', () => {
    expect(isOneOf(['1', '2'])('1')).toEqual(true);
    expect(isOneOf(['trye', 'false'])('true')).toEqual('value is not in list');
  });
  it('startsWith', () => {
    expect(startsWith('someprefix')('someprefix_andvalue')).toEqual(true);
    expect(startsWith('xxx')('xxy')).toEqual('value should starts with xxx');
  });
  it('endsWith', () => {
    expect(endsWith('somepostfix')('value_and_somepostfix')).toEqual(true);
    expect(endsWith('xxx')('yxx')).toEqual('value should ends with xxx');
  });
  it('isArrayUrl', () => {
    expect(isArrayUrl('https://google.com')).toEqual(true);
    expect(isArrayUrl('/foo/bar')).toEqual(true);
    expect(isArrayUrl('file://google.com')).toEqual('Invalid protocol file://google.com/');
    expect(isArrayUrl('not valid url')).toEqual('URL not valid url is not valid');
    expect(isArrayUrl('https://google.com,https://yandex.ru')).toEqual(true);
    expect(isArrayUrl('https://google.com, https://yandex.ru')).toEqual(true);
    expect(isArrayUrl('/foo/bar,/bar/baz')).toEqual(true);
    expect(isArrayUrl('file://google.com,file://yandex.ru')).toEqual(
      `Invalid protocol file://google.com/
Invalid protocol file://yandex.ru/`
    );
    expect(isArrayUrl('not valid url, other not valid')).toEqual(`URL not valid url is not valid
URL other not valid is not valid`);
  });
});

describe('combine validators', () => {
  it('should work', () => {
    expect(combineValidators([isUrl, endsWith('/')])('https://google.com/')).toEqual(false);
    expect(combineValidators([isUrl, endsWith('/')])('/foo/bar/')).toEqual(false);
    expect(combineValidators([isUrl, endsWith('/')])('https://google.com')).toEqual(
      'value should ends with /'
    );
    expect(combineValidators([isUrl, endsWith('/')])('google.com/')).toEqual(
      'URL google.com/ is not valid'
    );
    expect(combineValidators([isUrl, endsWith('/')])('asdjhpasojdh')).toEqual(
      'URL asdjhpasojdh is not valid; value should ends with /'
    );
  });
});
