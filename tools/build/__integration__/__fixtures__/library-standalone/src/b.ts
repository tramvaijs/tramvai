import isObject from '@tinkoff/utils/is/object';
import { MockerModule } from '@tramvai/module-mocker';
import { createToken } from '@tinkoff/dippy';
import { testString } from './foo.server';

export class B {
  check(value: unknown) {
    return isObject(value);
  }

  getModule() {
    return MockerModule;
  }

  createToken(name: string) {
    return createToken(name);
  }

  printTestString() {
    console.log(testString);
  }
}
