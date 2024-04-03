import { createElement, StrictMode } from 'react';
import { UniversalErrorBoundary } from '@tramvai/react';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import type {
  DEFAULT_ERROR_BOUNDARY_COMPONENT,
  EXTEND_RENDER,
  USE_REACT_STRICT_MODE,
} from '@tramvai/tokens-render';
import each from '@tinkoff/utils/array/each';
import { renderReact } from '../react';

type RootClientComponentProps = {
  consumerContext: any;
  extendRender?: ExtractDependencyType<typeof EXTEND_RENDER>;
  customRender?: any;
  di: any;
  useStrictMode: ExtractDependencyType<typeof USE_REACT_STRICT_MODE>;
  defaultErrorBoundary?: ExtractDependencyType<typeof DEFAULT_ERROR_BOUNDARY_COMPONENT>;
};

export const createRootElement = ({
  extendRender,
  di,
  consumerContext,
}: Pick<RootClientComponentProps, 'di' | 'extendRender' | 'consumerContext'>) => {
  let element = renderReact({ di }, consumerContext);

  if (extendRender) {
    each((render) => {
      element = render(element);
    }, extendRender);
  }

  return element;
};

const RootClientComponent = ({
  extendRender,
  useStrictMode,
  di,
  consumerContext,
}: Omit<RootClientComponentProps, 'defaultErrorBoundary'>) => {
  let element = createRootElement({ di, consumerContext, extendRender });

  if (useStrictMode) {
    element = createElement(StrictMode, null, element);
  }

  return element;
};

const RootClientComponentWithBoundary = ({
  defaultErrorBoundary,
  di,
  consumerContext,
  extendRender,
  customRender,
  useStrictMode,
}: RootClientComponentProps) => {
  const rootClientComponentProps = {
    di,
    consumerContext,
    extendRender,
    customRender,
    useStrictMode,
  };

  return (
    <UniversalErrorBoundary fallback={defaultErrorBoundary}>
      <RootClientComponent {...rootClientComponentProps} />
    </UniversalErrorBoundary>
  );
};

export default RootClientComponentWithBoundary;
