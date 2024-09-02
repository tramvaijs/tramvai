import { declareAction } from '@tramvai/core';

const action = declareAction({
  name: 'action',
  fn: () => {
    console.log('action');
  },
});

const secondAction = declareAction({
  name: 'secondAction',
  fn: () => {
    console.log('second action');
  },
  conditions: {
    onlyBrowser: true,
  },
});

export default declareAction({
  name: 'anonymousAction',
  fn: () => {
    console.log('anonymous action');
  },
  conditions: {
    onlyBrowser: true,
  },
});
