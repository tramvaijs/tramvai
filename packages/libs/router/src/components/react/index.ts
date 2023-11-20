import { TransitionsProvider } from './providers/transitions';
import { DefaultProvider } from './providers/default';

export type { RouterState } from './providers/types';
export { useRouter } from './useRouter';
export { useRoute } from './useRoute';
export { useUrl } from './useUrl';
export { useNavigate } from './useNavigate';
export { useViewTransition } from './useViewTransition';

export const Provider =
  process.env.__TRAMVAI_VIEW_TRANSITIONS === 'true' ||
  process.env.__TRAMVAI_REACT_TRANSITIONS === 'true'
    ? TransitionsProvider
    : DefaultProvider;
