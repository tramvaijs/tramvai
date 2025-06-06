import { CLICommand } from '../../models/command';

export type GeneratorName = 'action' | 'reducer' | 'component' | 'page' | 'bundle' | 'module';
export type Params = {
  generator?: GeneratorName;
  target?: string;
};

class GenerateCommand extends CLICommand<Params> {
  name = 'generate';

  description =
    'Command for code generation\n' +
    '  [target] - application name\n' +
    '  [generator] - action|reducer|bundle|component|page|module';

  command = 'generate [target] [generator]';

  options = [];

  alias = 'g';

  validators() {
    return [require('../../validators/commands/checkConfigExists').checkConfigExists];
  }

  action(parameters: Params) {
    // used require for lazy code execution
    return require('./generate').default(this.context, parameters);
  }
}

export default GenerateCommand;
