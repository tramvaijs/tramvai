import { useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import type { ChildAppReactConfig } from '@tramvai/tokens-child-app';
import { CHILD_APP_ERROR_BOUNDARY_TOKEN } from '@tramvai/tokens-child-app';
import type { ERROR_BOUNDARY_TOKEN } from '@tramvai/react';
import { useDi } from '@tramvai/react';
import { useStoreSelector } from '@tramvai/state';
import { ChildAppErrorBoundary } from './ChildAppErrorBoundary/ChildAppErrorBoundary';
import { ChildAppStore } from '../store';

type ErrorBoundaryHandler = ExtractDependencyType<typeof ERROR_BOUNDARY_TOKEN>[0];

type Props = {
  config: ChildAppReactConfig;
};

export const ChildAppErrorBoundaryWrapper = (props: PropsWithChildren<Props>) => {
  const { children, config } = props;
  const { fallback, name, version, tag } = config;
  const childAppLoadingStatus = useStoreSelector(ChildAppStore, (state) => {
    const key = `${name}@${version}`;
    const childAppState = state?.childAppPreloadStatusOnClient?.[key];
    return childAppState?.status;
  });

  const errorHandlers = useDi({ token: CHILD_APP_ERROR_BOUNDARY_TOKEN, optional: true });

  const decoratedErrorHandlers = useMemo(
    () =>
      errorHandlers?.map<ErrorBoundaryHandler>(
        (errorHandler) => (error, info) => errorHandler(error, info, { name, version, tag })
      ),
    [errorHandlers, name, version, tag]
  );
  return (
    <ChildAppErrorBoundary
      childAppLoadingStatus={childAppLoadingStatus}
      fallback={fallback as any}
      errorHandlers={decoratedErrorHandlers}
    >
      {children}
    </ChildAppErrorBoundary>
  );
};
