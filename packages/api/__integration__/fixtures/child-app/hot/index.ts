import { app } from './app';

if (typeof window !== 'undefined') {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = app;
  }
}
