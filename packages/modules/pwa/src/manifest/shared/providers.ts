import { commandLineListTokens, provide } from '@tramvai/core';
import { ResourceType, ResourceSlot, RESOURCES_REGISTRY } from '@tramvai/tokens-render';
import noop from '@tinkoff/utils/function/noop';
import { pwaConfigs } from '@tramvai/cli/lib/external/pwa';

import { validateRelativeUrl } from './utils/validateUrl';
import { PWA_MANIFEST_URL_TOKEN } from '../../tokens';

export const validateManifestUrlsProvider = provide({
  provide: commandLineListTokens.init,
  useFactory: () =>
    function validateSwUrlAndScope() {
      pwaConfigs.forEach((pwaConfig) => {
        if (pwaConfig.webmanifest) {
          validateRelativeUrl(pwaConfig.webmanifest.url);
        }
      });
    },
});

export const validateRelativeUrlProvider = provide({
  provide: commandLineListTokens.init,
  useFactory: ({ manifestUrl }) =>
    function validateSwUrlAndScope() {
      if (manifestUrl) {
        validateRelativeUrl(manifestUrl);
      }
    },
  deps: {
    manifestUrl: PWA_MANIFEST_URL_TOKEN,
  },
});

export const registerWebManifestProvider = provide({
  provide: commandLineListTokens.resolvePageDeps,
  useFactory: ({ resourcesRegistry, manifestUrl }) => {
    if (!manifestUrl) {
      return noop;
    }

    return function registerWebManifestAsResource() {
      resourcesRegistry.register({
        type: ResourceType.asIs,
        slot: ResourceSlot.HEAD_META,
        // @todo what about crossorigin, maybe optional?
        payload: `<link rel="manifest" href="${manifestUrl}">`,
      });
    };
  },
  deps: {
    manifestUrl: PWA_MANIFEST_URL_TOKEN,
    resourcesRegistry: RESOURCES_REGISTRY,
  },
});
