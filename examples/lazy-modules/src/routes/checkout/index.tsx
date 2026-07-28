import type { PageComponent } from '@tramvai/react';
import { useDi } from '@tramvai/react';
import { Link } from '@tramvai/module-router';
import { PaymentModule, PAYMENT_SERVICE_TOKEN } from '../../modules/PaymentModule';
import { AnalyticsModule, ANALYTICS_SERVICE_TOKEN } from '../../modules/AnalyticsModule';

const CheckoutPage: PageComponent = () => {
  const paymentService = useDi(PAYMENT_SERVICE_TOKEN);
  const analytics = useDi(ANALYTICS_SERVICE_TOKEN);

  const methods = paymentService.availableMethods();
  const { total, fee, currency } = paymentService.calculate(1000);

  analytics.track('checkout_viewed', { total });

  return (
    <div>
      <h1 id="checkout-title">Checkout</h1>
      <div id="payment-methods">
        <h2>Payment Methods</h2>
        <ul>
          {methods.map((method) => (
            <li key={method} className="payment-method">
              {method}
            </li>
          ))}
        </ul>
      </div>
      <div id="order-summary">
        <p>
          Amount: 1000 {currency}, Fee: {fee} {currency}, Total: {total} {currency}
        </p>
      </div>
      <div id="checkout-analytics">
        <p>Tracked: {analytics.getTrackedEvents().length} events</p>
      </div>
      <Link url="/">Back to Store</Link>
    </div>
  );
};

CheckoutPage.modules = [PaymentModule, AnalyticsModule];

export default CheckoutPage;
