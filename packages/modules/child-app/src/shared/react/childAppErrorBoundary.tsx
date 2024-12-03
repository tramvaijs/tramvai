import { useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import type { ChildAppReactConfig } from '@tramvai/tokens-child-app';
import { CHILD_APP_ERROR_BOUNDARY_TOKEN } from '@tramvai/tokens-child-app';
import type { ERROR_BOUNDARY_TOKEN } from '@tramvai/react';
import { useDi, UniversalErrorBoundary } from '@tramvai/react';

type ErrorBoundaryHandler = ExtractDependencyType<typeof ERROR_BOUNDARY_TOKEN>[0];

type Props = {
  config: ChildAppReactConfig;
};

export const ChildAppErrorBoundary = (props: PropsWithChildren<Props>) => {
  const { children, config } = props;
  const { fallback, name, version, tag } = config;

  const errorHandlers = useDi({ token: CHILD_APP_ERROR_BOUNDARY_TOKEN, optional: true });

  const decoratedErrorHandlers = useMemo(
    () =>
      errorHandlers?.map<ErrorBoundaryHandler>(
        (errorHandler) => (error, info) => errorHandler(error, info, { name, version, tag })
      ),
    [errorHandlers, name, version, tag]
  );

  return (
    <UniversalErrorBoundary fallback={fallback as any} errorHandlers={decoratedErrorHandlers}>
      {children}
    </UniversalErrorBoundary>
  );
};
