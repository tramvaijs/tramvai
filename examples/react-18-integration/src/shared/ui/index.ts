import { lazy } from '@tramvai/react';

export { Header } from './Header/Header';
export { Footer } from './Footer/Footer';
export { SlowList } from './slow-list';

export const AsyncComponent = lazy(() => import('./async-component'), { suspense: true });
