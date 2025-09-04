import { declareAction } from '@tramvai/core';

const action = declareAction({
  name: 'action',
  fn() {
    console.log('action');
  },
});

const secondAction = declareAction({
  fn() {
    console.log('second action');
  },
  conditions: {
    onlyBrowser: true,
  },
});

console.log(action, secondAction);
