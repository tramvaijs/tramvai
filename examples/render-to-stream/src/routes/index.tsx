import type { PageComponent } from '@tramvai/react';
import React, { Component, Suspense } from 'react';
import { bundleClientOnlyAction, bundleServerOnlyAction } from '../actions/bundleActions';
import { MainModal } from '../components/features/Modal/main';

const ChildComponent = () => {
  return <div>Child Component</div>;
};

const ChildFallback = () => {
  return <>Child fallback</>;
};

const ErrorComponent = () => {
  throw Error('Error');
  return <div>Error Component</div>;
};

const ErrorFallback = () => {
  return <>Error fallback</>;
};

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Error boundary</div>;
    }

    return this.props.children;
  }
}

export const MainPage: PageComponent = () => {
  return (
    <div>
      Main Page
      <Suspense fallback={<ChildFallback />}>
        <ChildComponent />
      </Suspense>
      <ErrorBoundary>
        <Suspense fallback={<ErrorFallback />}>
          <ErrorComponent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

MainPage.actions = [bundleServerOnlyAction, bundleClientOnlyAction];

MainPage.components = {
  modal: MainModal,
};

export default MainPage;
