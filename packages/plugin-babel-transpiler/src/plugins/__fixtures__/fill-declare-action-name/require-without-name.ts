// @ts-ignore
const { declareAction } = require('@tramvai/core');

// @ts-ignore
const action = declareAction({
  fn: () => {
    console.log('action');
  },
});

// @ts-ignore
const secondAction = declareAction({
  fn: () => {
    console.log('second action');
  },
  conditions: {
    onlyBrowser: true,
  },
});
