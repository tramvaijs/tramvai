import { LEVELS } from '../../constants';
import type { LogObj } from '../../logger.h';
import { BrowserReporter } from './browser';

jest.setSystemTime(0);

describe('@tinkoff/logger/reporters/browser', () => {
  it('should log inner error', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const error = new Error('outer error');
    Object.assign(error, {
      cause: new Error('inner error'),
    });

    const logObj: LogObj = {
      level: LEVELS.error,
      name: 'test error',
      date: new Date(0),
      type: 'error',
      args: [error],
    };

    const browserReporter = new BrowserReporter();

    browserReporter.log(logObj);

    // под капотом browser reporter вызывает console,
    // первые два аргумента - стилизация отображения
    // третий аргумент - это первый элемент в массиве args
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        cause: expect.objectContaining({
          message: expect.stringContaining('inner error'),
        }),
      })
    );
  });
});
