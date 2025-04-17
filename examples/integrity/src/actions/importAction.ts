import { declareAction } from '@tramvai/core';

export const importAction = declareAction({
  name: 'global-action',
  async fn() {
    const { default: data } = await import('./data');
    console.log(data);
  },
});
