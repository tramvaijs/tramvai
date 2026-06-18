import type { PageComponent } from '@tramvai/react';
import { Link } from '@tramvai/module-router';

const MainPage: PageComponent = () => {
  return (
    <div>
      <h1 id="main-title">Store</h1>
      <ul>
        <li>
          <Link url="/checkout/">Go to Checkout</Link>
        </li>
        <li>
          <Link url="/old/">Go to Old Catalog (bundle)</Link>
        </li>
        <li>
          <Link url="/imperative/">Go to Currency Converter (imperative)</Link>
        </li>
        <li>
          <Link url="/edge-cases/">Go to Edge Cases</Link>
        </li>
      </ul>
    </div>
  );
};

export default MainPage;
