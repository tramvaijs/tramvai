import { createUniqueActionKeyForQuery } from './createUniqueActionKeyForQuery';

describe('createUniqueActionKeyForQuery', () => {
  it('returns a key if the type of key is string', () => {
    const key = 'test';

    expect(
      createUniqueActionKeyForQuery({
        key,
        fn: () => {},
      })
    ).toBe(key);
  });

  it('returns a key if the type of key is array', () => {
    const key = ['test', 'something-else', 'one-more'];

    expect(
      createUniqueActionKeyForQuery({
        key,
        fn: () => {},
      })
    ).toBe(key.join('_'));
  });

  it('returns actionNamePostfix if the type of key is empty array', () => {
    const key = jest.fn();

    expect(
      createUniqueActionKeyForQuery({
        key: [],
        fn: () => {},
      })
    ).toBe('');
  });

  it('returns actionNamePostfix if the type of key is function', () => {
    const key = jest.fn();
    const actionPostfix = 'fooPostfix';

    expect(
      createUniqueActionKeyForQuery({
        key,
        actionNamePostfix: actionPostfix,
        fn: () => {},
      })
    ).toBe(actionPostfix);
  });

  it('returns actionNamePostfix if the type of key is string/array and actionNamePostfix exist', () => {
    const actionPostfix = 'examplePostfix';

    const stringKey = 'string';
    expect(
      createUniqueActionKeyForQuery({
        key: stringKey,
        actionNamePostfix: actionPostfix,
        fn: () => {},
      })
    ).toBe(actionPostfix);

    const arrayOfStringsKey = ['hello', 'world'];
    expect(
      createUniqueActionKeyForQuery({
        key: arrayOfStringsKey,
        actionNamePostfix: actionPostfix,
        fn: () => {},
      })
    ).toBe(actionPostfix);
  });
});
