import type { PageComponent } from '@tramvai/react';
import { useDi } from '@tramvai/react';
import { Link } from '@tramvai/module-router';
import { CURRENCY_SERVICE_TOKEN } from '../../modules/ImperativeModule';

const ImperativePage: PageComponent = () => {
  const currencyService = useDi(CURRENCY_SERVICE_TOKEN);
  const rates = currencyService.rates();
  const converted = currencyService.convert(1000, 'RUB', 'USD');

  return (
    <div>
      <h1 id="imperative-title">Currency Converter</h1>
      <div id="rates">
        <p>
          USD: {rates.USD}, EUR: {rates.EUR}, CNY: {rates.CNY}
        </p>
      </div>
      <div id="converted">
        <p>1000 RUB = {converted} USD</p>
      </div>
      <Link url="/">Back to Store</Link>
    </div>
  );
};

export default ImperativePage;
