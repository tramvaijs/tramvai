import { App } from './App';

if (typeof window !== 'undefined') {
  const { createRoot } = require('react-dom/client');

  const root = createRoot(document.getElementById('root')!);
  root.render(<App />);
}
