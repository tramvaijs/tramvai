import { commandLineListTokens, declareModule, provide, Scope } from '@tramvai/core';
import { ResourceType, ResourceSlot, RESOURCES_REGISTRY } from '@tramvai/tokens-render';
import { PWA_MANIFEST_URL_TOKEN } from '../../tokens';

const validateRelativeUrl = (url: string) => {
  if (!url.startsWith('/')) {
    throw new Error(`Webmanifest url should start from "/", got ${url}`);
  }
  if (!(url.endsWith('.json') || url.endsWith('.webmanifest'))) {
    throw new Error(`Webmanifest url should has .json or .webmanifest extension, got ${url}`);
  }
};

export const validateRelativeUrlProvider = provide({
  provide: commandLineListTokens.init,
  useFactory: ({ manifestUrl }) =>
    function validateSwUrlAndScope() {
      validateRelativeUrl(manifestUrl);
    },
  deps: {
    manifestUrl: PWA_MANIFEST_URL_TOKEN,
  },
});

export const registerWebManifestProvider = provide({
  provide: commandLineListTokens.customerStart,
  useFactory: ({ resourcesRegistry, manifestUrl }) =>
    async function registerWebManifest() {
      resourcesRegistry.register({
        type: ResourceType.asIs,
        slot: ResourceSlot.HEAD_META,
        // @todo what about crossorigin, maybe optional?
        payload: `<link rel="manifest" href="${manifestUrl}">`,
      });
    },
  deps: {
    resourcesRegistry: RESOURCES_REGISTRY,
    manifestUrl: PWA_MANIFEST_URL_TOKEN,
  },
});
