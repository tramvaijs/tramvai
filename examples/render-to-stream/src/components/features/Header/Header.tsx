import { Link } from '@tramvai/module-router';

export const Header = () => (
  <div>
    <h1>
      Tramvai{' '}
      <span role="img" aria-label="Salute">
        🥳
      </span>
    </h1>
    <ul>
      <li>
        <Link url="/">Main</Link>
      </li>
      <li>
        <Link url="/second/">Second</Link>
      </li>
      <li>
        <Link url="/deferred/">Deferred</Link>
      </li>
      <li>
        <Link url="/non-deferred/">Non-deferred</Link>
      </li>
      <li>
        <Link url="/deferred/foo/">Deferred Foo</Link>
      </li>
      <li>
        <Link url="/deferred/bar/">Deferred Bar</Link>
      </li>
      <li>
        <Link url="/deferred/baz/">Deferred Baz</Link>
      </li>
    </ul>
  </div>
);
