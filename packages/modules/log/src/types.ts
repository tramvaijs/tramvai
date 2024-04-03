import '@tramvai/tokens-common';

declare module '@tramvai/tokens-common' {
  interface AsyncLocalStorageState {
    logger?: Map<string, any>;
  }
}
