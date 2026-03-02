import { useEffect, useState } from 'react';
import type { PropsWithChildren, ComponentType } from 'react';
import { useDi } from '@tramvai/react';
import { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';
import {
  PAGE_RENDER_FALLBACK_COMPONENT_PREFIX,
  PAGE_RENDER_DEFAULT_FALLBACK_COMPONENT,
} from './tokens';
import { STATIC_PAGES_RESOLVE_PAGE_RENDER_MODE } from './private-tokens';

export const PageRenderWrapper = ({ children }: PropsWithChildren<{}>) => {
  const [mounted, setMounted] = useState(false);
  const pageService = useDi(PAGE_SERVICE_TOKEN);
  const resolvePageRenderMode = useDi(STATIC_PAGES_RESOLVE_PAGE_RENDER_MODE);
  const fallbackKey = useDi(PAGE_RENDER_FALLBACK_COMPONENT_PREFIX);
  const DefaultFallbackComponent = useDi({
    token: PAGE_RENDER_DEFAULT_FALLBACK_COMPONENT,
    optional: true,
  });

  const FallbackComponent: ComponentType<any> | null =
    pageService.resolveComponentFromConfig(fallbackKey as any) || DefaultFallbackComponent;

  const mode = resolvePageRenderMode();

  useEffect(() => {
    if (mode === 'client') {
      setMounted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (mode === 'client' && !mounted) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    return null;
  }
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export const pageRenderHOC = (WrapperPage: any) => (props: any) => {
  return (
    <PageRenderWrapper>
      <WrapperPage {...props} />
    </PageRenderWrapper>
  );
};
