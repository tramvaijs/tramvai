import type { ScopeVariants } from '../Provider';

export interface TokenType<T> {
  name: symbol;
  options: TokenOptions;
  isToken: true;
  isModernToken: true;
  toString(): string;
}

export interface TokenOptions {
  multi?: boolean;
  scope?: ScopeVariants;
}
