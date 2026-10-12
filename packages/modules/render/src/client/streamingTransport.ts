import type { StreamingTransportRegistry } from '@tramvai/tokens-render';
import type { StreamingRegistry } from '../shared/streamingTransport/registry.inline';
import { createStreamingRegistry } from '../shared/streamingTransport/registry.inline';
import { STREAMING_REGISTRY_GLOBAL } from '../shared/streamingTransport/constants';

declare global {
  interface Window {
    [STREAMING_REGISTRY_GLOBAL]?: StreamingRegistry;
  }
}

/**
 * Registry is created by inline script in the page head,
 * but it can be missed, e.g. for the page rendered without streaming
 */
export const getStreamingRegistry = (): StreamingTransportRegistry => {
  if (!window[STREAMING_REGISTRY_GLOBAL]) {
    window[STREAMING_REGISTRY_GLOBAL] = createStreamingRegistry();
  }

  return window[STREAMING_REGISTRY_GLOBAL];
};
