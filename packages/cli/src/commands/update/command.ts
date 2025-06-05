import { CLICommand } from '../../models/command';
import type { Params } from './update';

class UpdateCommand extends CLICommand {
  name = 'update';

  description = `All tramvai packages update command
  [to] - target version <latest|prerelease|X.X.X|^X.X.X> (default: latest)`;

  command = `update [to]`;

  options = [];

  alias = 'u';

  validators() {
    return [require('./checkVersionValidator').checkVersion];
  }

  async action(parameters: Params) {
    // used require for lazy code execution
    return require('./update').default(this.context, parameters);
  }
}

export default UpdateCommand;
