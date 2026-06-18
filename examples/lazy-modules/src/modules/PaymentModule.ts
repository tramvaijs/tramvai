import { createToken, declareModule, provide, Scope } from '@tramvai/core';

export interface PaymentService {
  availableMethods(): string[];
  calculate(amount: number): { total: number; fee: number; currency: string };
}

export const PAYMENT_SERVICE_TOKEN = createToken<PaymentService>('paymentService');

export const PaymentModule = declareModule({
  name: 'PaymentModule',
  providers: [
    provide({
      provide: PAYMENT_SERVICE_TOKEN,
      scope: Scope.SINGLETON,
      useValue: {
        availableMethods() {
          return ['card', 'sbp', 'installments'];
        },
        calculate(amount: number) {
          const fee = Math.round(amount * 0.02);
          return { total: amount + fee, fee, currency: 'RUB' };
        },
      },
    }),
  ],
});
