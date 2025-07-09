const path = require('node:path');

describe('custom eslint plugin tramvai', () => {
  it('should return default config with tramvai rules', () => {
    const compatConfig = require('./__fixtures__/default/eslint-plugin-tramvai-compat');

    expect(compatConfig).toMatchSnapshot();
  });

  it('should return custom config with polyfills from default', () => {
    const compatConfig = require('./__fixtures__/custom-default/eslint-plugin-tramvai-compat');

    expect(compatConfig.rules['es-x/no-promise-withresolvers']).toBe(0);
    expect(compatConfig.rules['es-x/no-float16array']).toBe(0);
  });

  it('should return custom config with polyfills from modern', () => {
    const compatConfig = require('./__fixtures__/modern/eslint-plugin-tramvai-compat');

    expect(compatConfig.rules['es-x/no-string-prototype-iswellformed-towellformed']).toBe(0);
  });

  it('should return custom config with custom browserslist', () => {
    const compatConfig = require('./__fixtures__/custom-browserslist/eslint-plugin-tramvai-compat');

    expect(compatConfig.rules['es-x/no-weakrefs']).toBe(0);
  });

  it('should return custom config with custom package', () => {
    const compatConfig = require('./__fixtures__/custom-package/eslint-plugin-tramvai-compat');

    // check web polyfil import
    expect(compatConfig.settings.polyfills.includes('structuredClone')).toBeTruthy();

    // check custom rule usage
    expect(compatConfig.rules['es-x/no-atomics']).toBe(0);

    // check modern browserslist config usage
    expect(compatConfig.rules['es-x/no-weakrefs']).toBe(0);
  });
});
