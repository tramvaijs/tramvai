import type { PageComponent } from '@tramvai/react';
import { createBundle } from '@tramvai/core';
import { useDi } from '@tramvai/react';
import { Link } from '@tramvai/module-router';
import { AnalyticsModule, ANALYTICS_SERVICE_TOKEN } from '../modules/AnalyticsModule';
import { PaymentModule, PAYMENT_SERVICE_TOKEN } from '../modules/PaymentModule';

const CatalogPage: PageComponent = () => {
  const analytics = useDi(ANALYTICS_SERVICE_TOKEN);
  const paymentService = useDi(PAYMENT_SERVICE_TOKEN);

  analytics.track('catalog_viewed', { page: 'old-catalog' });
  const events = analytics.getTrackedEvents();
  const methods = paymentService.availableMethods();

  return (
    <div>
      <h1 id="catalog-title">Product Catalog (bundle)</h1>
      <div id="analytics-info">
        <p>Tracked events: {events.length}</p>
      </div>
      <div id="catalog-payment-methods">
        <p>Available: {methods.join(', ')}</p>
      </div>
      <Link url="/">Back to Store</Link>
    </div>
  );
};

// PaymentModule from page component + AnalyticsModule from bundle = both register,
// and AnalyticsModule deduplicates if already registered
CatalogPage.modules = [PaymentModule];

export default createBundle({
  name: 'catalogBundle',
  components: {
    'catalogBundle/CatalogPage': CatalogPage,
  },
  modules: [AnalyticsModule],
});
