import { Link } from '@tramvai/module-router';

const links = [
  ['/', 'Overview'],
  ['/baseline/', '1. Baseline (blocking prefetch)'],
  ['/deferred-use-query/', '2. Deferred + useQuery'],
  ['/deferred-suspense/', '3. Deferred + useSuspenseQuery'],
  ['/parallel/', '4. Parallel queries'],
  ['/errors/', '5. Errors'],
  ['/timeout/', '6. Stream timeout'],
  ['/spa/1/', '7. SPA navigation'],
  ['/child-app/', '8. Child app'],
  ['/nested/', '9. Nested queries'],
  ['/no-prefetch/', '10. Hooks without prefetch'],
  ['/infinite/', '11. Infinite queries'],
];

export const Header = () => (
  <nav>
    <h1>react-query streaming playground</h1>
    <ul>
      {links.map(([url, title]) => (
        <li key={url}>
          <Link url={url}>{title}</Link>
        </li>
      ))}
    </ul>
    <p>
      Query params: <code>?renderMode=sync|blocking</code> (default streaming),{' '}
      <code>?streamingTimeout=ms</code> (default 5000)
    </p>
    <hr />
  </nav>
);
