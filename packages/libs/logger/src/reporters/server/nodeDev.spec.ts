import { LEVELS } from '../../constants';
import { NodeDevReporter } from './nodeDev';

describe('@tinkoff/logger/reporters/nodeDev', () => {
  it('should log inner error', () => {
    // @ts-expect-error - typedefinition Error.cause in lib: ["es2022"]
    const error = new Error('outer error', { cause: new Error('inner error') });

    const stdout = {
      write: jest.fn(),
    };

    const nodeBasicReporter = new NodeDevReporter({
      stdout,
    });

    const logObj = {
      type: 'error',
      name: 'test name',
      date: new Date(0),
      level: LEVELS.error,
    };

    nodeBasicReporter.log({
      ...logObj,
      args: [error],
    });

    expect(stdout.write).toHaveBeenCalledWith(expect.stringContaining('inner error'));

    nodeBasicReporter.log({
      ...logObj,
      args: [error, 'test error'],
    });

    expect(stdout.write).toHaveBeenCalledWith(expect.stringContaining('inner error'));

    nodeBasicReporter.log({
      ...logObj,
      args: [{ message: 'test error', error }],
    });

    expect(stdout.write).toHaveBeenCalledWith(expect.stringContaining('inner error'));
  });
});
