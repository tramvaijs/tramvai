import { CLICommand } from '../../models/command';
import { checkPackage } from './checkPackageValidator';
import type { Params } from './add';

class AddCommand extends CLICommand {
  name = 'add';

  description = 'Tramvai package install command';

  command = 'add <packageName>';

  options = [
    {
      name: '-D, --dev',
      description: 'Save package to devDependencies',
    },
  ];

  alias = '';

  validators = [checkPackage];

  async action(parameters: Params) {
    // used require for lazy code execution
    return require('./add').default(this.context, parameters);
  }
}

export default AddCommand;
