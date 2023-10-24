import { RuleTester } from 'eslint';
import { rule } from './no-lambda-fn-in-actions';

const tests: {
  valid?: Array<string | RuleTester.ValidTestCase>;
  invalid?: RuleTester.InvalidTestCase[];
} = {
  valid: [
    {
      code: `declareAction({ fn() {} });`,
    },
    {
      code: `declareAction({ name: "test", fn() {} });`,
    },
    {
      code: `declareAction({ otherProp: () => {} });`,
    },
  ],
  invalid: [
    {
      code: `declareAction({ fn: () => {const somevar = {};} });`,
      output: `declareAction({ fn () { const somevar = {}; } });`,
      errors: [
        {
          messageId: 'disallowedArrowFn',
        },
      ],
    },
    {
      code: `declareAction({ name: "test", fn: () => {const somevar = {};} });`,
      output: `declareAction({ name: "test", fn () { const somevar = {}; } });`,
      errors: [
        {
          messageId: 'disallowedArrowFn',
        },
      ],
    },
  ],
};

const jsRuleTester = new RuleTester({
  parser: require.resolve('babel-eslint'),
});

const tsRuleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

jsRuleTester.run('no-lambda-fn-in-action-js', rule, tests);
tsRuleTester.run('no-lambda-fn-in-action-ts', rule, tests);
