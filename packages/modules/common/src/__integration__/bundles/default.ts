import { createBundle } from '@tramvai/core';
import ActionTestPageStart from '../pages/actionTestPageStart';
import ActionTestPageEnd from '../pages/actionTestPageEnd';
import ActionExecutionOnServer from '../pages/actionExecutionOnServer';

export default createBundle({
  name: 'mainDefault',
  components: {
    actionTestPageStart: ActionTestPageStart,
    actionTestPageEnd: ActionTestPageEnd,
    actionExecutionOnServer: ActionExecutionOnServer,
  },
});
