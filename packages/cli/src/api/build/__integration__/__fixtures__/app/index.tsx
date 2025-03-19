import { hydrateRoot } from 'react-dom/client';
import App from './App';

const bundlesMap = {
  main: () => import('./bundles/main'),
  first: () => import('./bundles/first'),
  second: () => import('./bundles/second'),
  third: () => import('./bundles/third'),
};

if (typeof window === 'undefined') {
  require('./server.tsx');
}

if (typeof window !== 'undefined') {
  const url = new URL(window.location.href);

  if (url.searchParams.has('bundle')) {
    bundlesMap[url.searchParams.get('bundle')]().then(({ default: name }) =>
      console.log(`loaded bundle ${name}`)
    );
  }

  hydrateRoot(document.getElementById('root')!, <App />);
}
