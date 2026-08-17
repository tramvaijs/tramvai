import { pwaScopes } from '@tramvai/cli/lib/external/pwa';

export const isApplicationAsset = (request: Request) =>
  request.url.startsWith(process.env.ASSETS_PREFIX!);

export const isApplicationScope = (request: Request) => {
  const { pathname } = new URL(request.url);

  return pwaScopes.some((pwaScope) => pathname.startsWith(pwaScope));
};
