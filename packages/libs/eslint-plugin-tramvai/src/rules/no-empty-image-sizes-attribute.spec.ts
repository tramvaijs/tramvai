import { RuleTester } from 'eslint';

import { rule } from './no-empty-image-sizes-attribute';

const tests: {
  valid?: (string | RuleTester.ValidTestCase)[];
  invalid?: RuleTester.InvalidTestCase[];
} = {
  valid: [{ code: '<TramvaiImage src="image.png" sizes="(min-width: 800px) 800px, 100vw" />' }],
  invalid: [
    {
      code: '<TramvaiImage src="image.png" />',
      errors: [
        {
          message:
            'sizes prop is not provided to TramvaiImage. Always set the sizes attribute, this will allow the browser to load images more optimally',
        },
      ],
    },
  ],
};

const jsRuleTester = new RuleTester({
  parser: require.resolve('@babel/eslint-parser'),
  parserOptions: {
    requireConfigFile: false,
    babelOptions: { babelrc: false, configFile: false, presets: ['@babel/preset-react'] },
  },
});

const tsRuleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaFeatures: { jsx: true } },
});

jsRuleTester.run('no-empty-image-sizes-attribute-js', rule, tests);
tsRuleTester.run('no-empty-image-sizes-attribute-ts', rule, tests);
