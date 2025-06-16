import { declareAction } from '@tramvai/core';

const action = declareAction({
  fn: () => {
    console.log('action');
  },
});

const secondAction = declareAction({
  fn: () => {
    console.log('second action');
  },
  conditions: {
    onlyBrowser: true,
  },
});

export default declareAction({
  fn: () => {
    console.log('anonymous action');
  },
  conditions: {
    onlyBrowser: true,
  },
});
