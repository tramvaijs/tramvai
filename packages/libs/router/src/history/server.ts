import { logger } from '../logger';
import { History } from './base';

export class ServerHistory extends History {
  save() {}

  go() {
    logger.warn({
      event: 'history.server',
      message: 'Trying to change history on server',
    });

    return Promise.resolve();
  }

  getCurrentState() {
    logger.warn({
      event: 'history.server',
      message: 'Trying to get current state on server',
    });

    return null;
  }
}
