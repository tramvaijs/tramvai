import App from './App';
import { hydrateRoot } from 'react-dom/client';

const bundlesMap = {
  main: () => import('./bundles/main'),
  first: () => import('./bundles/first'),
  second: () => import('./bundles/second'),
  third: () => import('./bundles/third'),
};

if (typeof window === 'undefined') {
  require('./server')
} else {
  const url = new URL(window.location.href);

  if (url.searchParams.has('bundle')) {
    bundlesMap[
      url.searchParams.get('bundle') as keyof typeof bundlesMap
    ]().then(({ default: name }: { default: string }) => console.log(`loaded bundle ${name}`));
  }

  hydrateRoot(document.getElementById('root')!, <App />);
}
