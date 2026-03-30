import type React from 'react';
import { createToken } from '@tinkoff/dippy';
import type { UniversalErrorBoundaryFallbackProps } from './UniversalErrorBoundary';

export type ErrorSeverity = 'critical' | 'error';
type ErrorBoundaryHandler = (error: Error, errorInfo: React.ErrorInfo) => void;

/**
 * @deprecated subsribe to `TRAMVAI_HOOKS_TOKEN['react:error']` hook instead, looking for the `page-error-boundary` event
 */
export const ERROR_BOUNDARY_TOKEN = createToken<ErrorBoundaryHandler>(
  'reactErrorBoundaryHandlers',
  {
    multi: true,
  }
);

/**
 * @deprecated
 * Use a file-based root error boundary instead.
 */
export const ROOT_ERROR_BOUNDARY_COMPONENT_TOKEN = createToken<
  React.ComponentType<UniversalErrorBoundaryFallbackProps>
>('rootErrorBoundaryComponent');

/**
 * @deprecated
 */
export const ERROR_BOUNDARY_FALLBACK_COMPONENT_TOKEN = createToken<React.ReactElement>(
  'errorBoundaryFallbackComponent'
);
