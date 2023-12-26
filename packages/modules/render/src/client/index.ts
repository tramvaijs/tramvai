import type {
  EXTEND_RENDER,
  REACT_SERVER_RENDER_MODE,
  RENDERER_CALLBACK,
  USE_REACT_STRICT_MODE,
  DEFAULT_ERROR_BOUNDARY_COMPONENT,
} from '@tramvai/tokens-render';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import { createElement } from 'react';
import { renderer } from './renderer';
import RootClientComponent, { createRootElement } from './RootClientComponent';

export function rendering({
  logger,
  consumerContext,
  customRender,
  extendRender,
  di,
  useStrictMode,
  rendererCallback,
  renderMode,
  defaultErrorBoundary,
}: {
  logger: any;
  consumerContext: any;
  extendRender?: ExtractDependencyType<typeof EXTEND_RENDER>;
  customRender?: any;
  di: any;
  useStrictMode: ExtractDependencyType<typeof USE_REACT_STRICT_MODE>;
  rendererCallback?: ExtractDependencyType<typeof RENDERER_CALLBACK>;
  renderMode?: ExtractDependencyType<typeof REACT_SERVER_RENDER_MODE>;
  defaultErrorBoundary?: ExtractDependencyType<typeof DEFAULT_ERROR_BOUNDARY_COMPONENT>;
}) {
  const log = logger('module-render');

  return new Promise<void>((resolve, reject) => {
    if (customRender) {
      // Provide possibility of customRender for root JSX.Element
      // Can be useful in case of custom render function on client or to replace hydration
      return customRender(createRootElement({ extendRender, di, consumerContext }));
    }

    const renderResult = createElement(RootClientComponent, {
      defaultErrorBoundary,
      extendRender,
      customRender,
      useStrictMode,
      consumerContext,
      di,
    });

    const container = () => document.querySelector('.application');
    const executeRendererCallbacks = (renderErr?: Error) =>
      rendererCallback?.forEach((cb) => {
        try {
          cb(renderErr);
        } catch (cbError) {
          // eslint-disable-next-line no-console
          console.error(cbError);
        }
      });
    const callback = () => {
      log.debug('App rendering');
      document.querySelector('html').classList.remove('no-js');
      executeRendererCallbacks();
      resolve();
    };
    const params = { element: renderResult, container, callback, log, renderMode };

    try {
      renderer(params);
    } catch (e) {
      executeRendererCallbacks(e);
      reject(e);
    }
  });
}
