import { useIsomorphicLayoutEffect } from '@tramvai/state';
import { ChildAppReactConfig } from '@tramvai/tokens-child-app';
import { useContext } from 'react';
import { RenderContext } from './render-context';

type AnyError = Error & { [key: string]: any };
interface Props extends ChildAppReactConfig {
  error?: AnyError;
}

export const ChildAppFallbackWrapper = ({
  name,
  fallback: Fallback,
  tag,
  version,
  error,
}: Props) => {
  const renderManager = useContext(RenderContext);

  useIsomorphicLayoutEffect(() => {
    renderManager?.hooks?.mountFailed?.call({ name, version, tag });
  }, []);

  return Fallback ? <Fallback error={error} /> : null;
};
