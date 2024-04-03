import type { ExtractDependencyType } from '@tinkoff/dippy';
import React, { Component } from 'react';
import { withDi } from '../di/hoc';
import { FallbackError } from './fallback';
import { ERROR_BOUNDARY_TOKEN, ERROR_BOUNDARY_FALLBACK_COMPONENT_TOKEN } from './tokens';

interface Props {
  errorHandlers?: ExtractDependencyType<typeof ERROR_BOUNDARY_TOKEN> | null;
  fallbackComponent?: React.ReactElement | null;
  fallbackComponentFromDi?: React.ReactElement | null;
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * @deprecated Use UniversalErrorBoundary component
 */
@withDi({
  errorHandlers: { token: ERROR_BOUNDARY_TOKEN, optional: true },
  fallbackComponentFromDi: { token: ERROR_BOUNDARY_FALLBACK_COMPONENT_TOKEN, optional: true },
})
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static displayName = 'ErrorBoundary';

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { errorHandlers } = this.props;

    if (errorHandlers) {
      errorHandlers.forEach((handler) => {
        handler(error, errorInfo);
      });
    }
  }

  render() {
    const { children, fallbackComponent, fallbackComponentFromDi } = this.props;
    const { hasError } = this.state;

    if (!hasError) {
      return children;
    }

    return fallbackComponent || fallbackComponentFromDi || <FallbackError />;
  }
}
