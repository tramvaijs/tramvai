import type {
  ExtendedModule,
  ModuleType,
  Provider,
  Container,
  TokenInterface,
  ExtractDependencyType,
} from '@tinkoff/dippy';
import { initContainer, optional } from '@tinkoff/dippy';

export type Parameters = {
  modules?: (ModuleType | ExtendedModule)[];
  initialProviders?: Provider[];
  providers?: Provider[];
};

export class Tramvai {
  #di: Container;

  constructor(parameters: Parameters) {
    this.#di = initContainer(parameters);
  }

  resolve<Token extends TokenInterface<any>>(token: Token): ExtractDependencyType<Token> | null {
    return this.#di.get(optional(token)) as ExtractDependencyType<Token> | null;
  }
}
