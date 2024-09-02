// @ts-ignore
const { declareAction } = require('@tramvai/core');

// @ts-ignore
const action = declareAction({
  name: 'action',
  fn: () => {
    console.log('action');
  },
});

// @ts-ignore
const secondAction = declareAction({
  name: 'secondAction',
  fn: () => {
    console.log('second action');
  },
  conditions: {
    onlyBrowser: true,
  },
});
