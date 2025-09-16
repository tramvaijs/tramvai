import { commandLineListTokens, DI_TOKEN, provide } from '@tramvai/core';
import { ResourceType, ResourceSlot, RESOURCES_REGISTRY } from '@tramvai/tokens-render';
import { PWA_MANIFEST_INIT_COMMAND_LINE, PWA_MANIFEST_URL_TOKEN } from '../../tokens';

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
  provide: commandLineListTokens.init,
  useFactory: ({ manifestCommandLine, manifestUrl, di }) =>
    function registerWebManifestCommandLine() {
      di.register({
        provide: manifestCommandLine
          ? commandLineListTokens[manifestCommandLine]
          : commandLineListTokens.customerStart,
        useFactory: ({ resourcesRegistry }) =>
          function registerWebManifestAsResource() {
            resourcesRegistry.register({
              type: ResourceType.asIs,
              slot: ResourceSlot.HEAD_META,
              // @todo what about crossorigin, maybe optional?
              payload: `<link rel="manifest" href="${manifestUrl}">`,
            });
          },
        deps: {
          resourcesRegistry: RESOURCES_REGISTRY,
        },
      });
    },
  deps: {
    manifestUrl: PWA_MANIFEST_URL_TOKEN,
    di: DI_TOKEN,
    manifestCommandLine: { token: PWA_MANIFEST_INIT_COMMAND_LINE, optional: true },
  },
});
