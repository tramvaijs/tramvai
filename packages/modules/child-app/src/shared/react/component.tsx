import noop from '@tinkoff/utils/function/noop';
import { useMemo, useContext, useState, useEffect, Suspense, memo } from 'react';
import type { ChildAppReactConfig } from '@tramvai/tokens-child-app';
import {
  CHILD_APP_INTERNAL_RENDER_TOKEN,
  CHILD_APP_RESOLVE_CONFIG_TOKEN,
} from '@tramvai/tokens-child-app';
import { LOGGER_TOKEN } from '@tramvai/tokens-common';
import { useDi } from '@tramvai/react';
import { RenderContext } from './render-context';
import { Extractor } from './extractor';
import { ChildAppErrorBoundaryWrapper } from './childAppErrorBoundaryWrapper';

const FailedChildAppFallback = ({ config }: { config: ChildAppReactConfig }) => {
  const { name, version, tag, fallback: Fallback } = config;
  const logger = useDi(LOGGER_TOKEN);

  const log = logger('child-app:render');
  // On client-side hydration errors will be handled in `hydrateRoot` `onRecoverableError` property,
  // and update errors will be handled in Error Boundaries.
  //
  // Also, this component never be rendered at client-side, and we check environment only for safety
  // (server errors logic described here https://github.com/reactjs/rfcs/blob/main/text/0215-server-errors-in-react-18.md).
  //
  // On server-side, we still use `renderToString`,
  // and need to manually log render errors for components, wrapped in Suspense Boundaries.
  if (typeof window === 'undefined') {
    log.error({
      event: 'failed-render',
      message: 'child-app failed to render, will try to recover during hydration',
      childApp: { name, version, tag },
    });
  }

  return Fallback ? <Fallback /> : null;
};

// eslint-disable-next-line max-statements
const ChildAppWrapper = ({
  name,
  version,
  tag,
  props,
  fallback: Fallback,
}: ChildAppReactConfig) => {
  const renderManager = useContext(RenderContext);
  const logger = useDi(LOGGER_TOKEN);

  const log = logger('child-app:render');
  const [maybeDi, maybePromiseDi] = useMemo(() => {
    return renderManager!.getChildDi({ name, version, tag });
  }, [name, version, tag, renderManager]);

  const [di, setDi] = useState(maybeDi);
  const [promiseDi, setPromiseDi] = useState(maybePromiseDi);

  useEffect(() => {
    if (!di && promiseDi) {
      // any errors with loading child-app should be handled in some other place
      promiseDi
        .then(setDi)
        .finally(() => setPromiseDi(undefined))
        .catch(noop);
    }
  }, [di, promiseDi]);

  if (!di && promiseDi) {
    // in case child-app was not rendered on ssr
    // and we have to wait before it's loading
    return Fallback ? <Fallback /> : null;
  }

  if (!di) {
    log.error({
      event: 'not-found',
      message: 'child-app was not initialized',
      childApp: { name, version, tag },
    });

    if (process.env.__TRAMVAI_CONCURRENT_FEATURES || typeof window !== 'undefined') {
      throw new Error(
        `Child-app was not initialized, check the loading error for child-app "${name}"`
      );
    }

    return Fallback ? <Fallback /> : null;
  }

  try {
    const Cmp = di.get({ token: CHILD_APP_INTERNAL_RENDER_TOKEN, optional: true });

    if (!Cmp) {
      log.error({
        event: 'empty-render',
        message: 'Child-app does not provide render token',
        childApp: { name, version, tag },
      });

      return null;
    }

    return (
      <Extractor di={di}>
        <Cmp di={di} props={props} />
      </Extractor>
    );
  } catch (error: any) {
    log.error({
      event: 'get-render',
      message: 'Cannot get render token from child-app',
      childApp: {
        name,
        version,
        tag,
      },
      error,
    });

    return null;
  }
};

export const ChildApp = memo((config: ChildAppReactConfig) => {
  let result = <ChildAppWrapper {...config} />;
  const resolveExternalConfig = useDi(CHILD_APP_RESOLVE_CONFIG_TOKEN);
  const { name, version, tag } = config;
  const resolvedExternalConfig = useMemo(() => {
    return resolveExternalConfig({
      name,
      tag,
      version,
    });
  }, [name, version, tag, resolveExternalConfig]);

  const resultConfig = {
    ...config,
    version: resolvedExternalConfig?.version,
    tag: resolvedExternalConfig?.tag ?? 'latest',
  };

  if (process.env.__TRAMVAI_CONCURRENT_FEATURES) {
    result = (
      <Suspense fallback={<FailedChildAppFallback config={resultConfig} />}>{result}</Suspense>
    );
  }

  return (
    <ChildAppErrorBoundaryWrapper config={resultConfig}>{result}</ChildAppErrorBoundaryWrapper>
  );
});
