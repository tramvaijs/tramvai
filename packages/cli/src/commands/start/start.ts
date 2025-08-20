import type { Context } from '../../models/context';
import type { CommandResult } from '../../models/command';

import { app } from '../index';

export default async (
  context: Context,
  parameters,
  finishedBuildCallback: Function
): Promise<CommandResult | any> => {
  const { staticServer } = await app.run('start', {
    ...parameters,
    // игнорируем ошибку т.к. сборка не обязательно правильная при запуске, но при виде ошибки разработчик сможет поправить и не понадобится перезапускать с нуля
    strictErrorHandle: false,
  });

  await finishedBuildCallback();

  await new Promise((resolve) => {
    staticServer.on('close', resolve);
  });

  return Promise.resolve({
    status: 'ok',
  });
};
