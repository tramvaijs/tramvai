import { CLICommand } from '../../models/command';

class LintCommand extends CLICommand {
  name = 'lint';

  description = 'Command to run lint';

  command = 'lint <target>';

  options = [];

  alias = 'l';

  validators() {
    return [require('../../validators/commands/checkBuild').checkApplication];
  }

  action() {
    return Promise.resolve({
      status: 'ok',
    });
  }
}

export default LintCommand;
