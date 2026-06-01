import type {
  ErrorBoundaryComponent,
  LazyComponentWrapper,
  NestedLayoutComponent,
  PageComponent,
} from '@tramvai/react';
import type { Papi } from '@tramvai/papi';

export default {
  routes: {},
  pages: {},
  layouts: {},
  errorBoundaries: {},
  wildcards: {},
  formActions: {},
} as {
  routes: Record<string, LazyComponentWrapper<PageComponent>>;
  pages: Record<string, LazyComponentWrapper<PageComponent>>;
  layouts: Record<string, LazyComponentWrapper<NestedLayoutComponent>>;
  errorBoundaries: Record<string, LazyComponentWrapper<ErrorBoundaryComponent>>;
  wildcards: Record<string, LazyComponentWrapper<PageComponent>>;
  formActions: Record<string, Papi>;
};
