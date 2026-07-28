import { createToken, declareModule, provide, Scope } from '@tramvai/core';

export interface CurrencyService {
  convert(amount: number, from: string, to: string): number;
  rates(): Record<string, number>;
}

export const CURRENCY_SERVICE_TOKEN = createToken<CurrencyService>('currencyService');

// default export for dynamic import — registry's load() uses `m.default`
const ImperativeModule = declareModule({
  name: 'ImperativeModule',
  providers: [
    provide({
      provide: CURRENCY_SERVICE_TOKEN,
      scope: Scope.SINGLETON,
      useValue: {
        convert(amount: number, _from: string, _to: string) {
          return Math.round(amount * 0.011 * 100) / 100;
        },
        rates() {
          return { USD: 0.011, EUR: 0.01, CNY: 0.078 };
        },
      },
    }),
  ],
});

export default ImperativeModule;
