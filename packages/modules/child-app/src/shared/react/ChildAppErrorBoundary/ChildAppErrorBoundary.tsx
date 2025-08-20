import React, { Component } from 'react';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import type { ERROR_BOUNDARY_TOKEN } from '@tramvai/react';
import { ChildAppReactConfig } from '@tramvai/tokens-child-app';
import { FallbackError } from './FallbackError';
import { ChildAppFallbackWrapper } from '../ChildAppFallbackWrapper';

type AnyError = Error & { [key: string]: any };

export interface ChildAppErrorBoundaryFallbackProps {
  error: AnyError;
}

export interface ChildAppErrorBoundaryProps {
  config: ChildAppReactConfig;
  childAppLoadingStatus?: string;
  error?: AnyError | null;
  fallback?: React.ComponentType<ChildAppErrorBoundaryFallbackProps>;
  errorHandlers?: ExtractDependencyType<typeof ERROR_BOUNDARY_TOKEN> | null;
  /**
   * @deprecated
   */
  fallbackFromDi?: React.ReactElement | null;
  children?: React.ReactNode;
}

interface State {
  error: AnyError | null;
  childAppLoadingStatus?: string | null;
}

type Props = ChildAppErrorBoundaryProps;

export class ChildAppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      error: props.error || null,
      childAppLoadingStatus: null,
    };
  }

  static displayName = 'ChildAppErrorBoundary';

  static getDerivedStateFromProps(props: Props, state: State) {
    if (!props.childAppLoadingStatus) {
      return { error: props.error || state.error };
    }

    if (
      state.childAppLoadingStatus &&
      props.childAppLoadingStatus &&
      props.childAppLoadingStatus !== state.childAppLoadingStatus
    ) {
      return { error: props.error || null, childAppLoadingStatus: props.childAppLoadingStatus };
    }

    return {
      error: props.error || state.error,
      childAppLoadingStatus: props.childAppLoadingStatus,
    };
  }

  static getDerivedStateFromError(error: AnyError) {
    return { error };
  }

  componentDidCatch(error: AnyError, errorInfo: React.ErrorInfo) {
    const { errorHandlers } = this.props;

    if (errorHandlers) {
      errorHandlers.forEach((handler) => {
        handler(error, errorInfo);
      });
    }
  }

  render(): React.ReactNode {
    const { children, fallback: Fallback, fallbackFromDi, config } = this.props;
    const { error } = this.state;
    if (!error) {
      return children;
    }
    if (Fallback) {
      return <ChildAppFallbackWrapper fallback={Fallback as any} {...config} error={error} />;
    }
    if (fallbackFromDi) {
      return fallbackFromDi;
    }
    return <FallbackError />;
  }
}
