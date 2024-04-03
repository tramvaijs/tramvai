import ReactDOM from 'react-dom';
import App from './App';

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

  ReactDOM.hydrate(<App />, document.getElementById('root'));
}
