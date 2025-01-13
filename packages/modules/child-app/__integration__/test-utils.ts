import { renderFactory, requestFactory } from '@tramvai/test-helpers';

export const normalizeSuspense = (html: string) => {
  return (
    html
      .replace(/<template .+><\/template>/gs, '<Suspense />')
      // Remove any comments that are coming from the suspense usage
      // as not every version is using Suspense and snapshots will be different
      // without such normalization
      // TODO: remove after dropping compatibility with v2.0.0
      .replace(/^\s+<!?--\/?\$!?-->\n/gm, '')
      .replace(/<!?--\/?\$!?-->/g, '')
  );
};

export const renderAppFactory = (getServerUrl: () => string) => async (page: string) => {
  const request = requestFactory(getServerUrl());
  const render = renderFactory(
    request,
    // remove wrong </link> tag that was appearing in the old tramvai versions
    // TODO: remove after dropping compatibility with v2.0.0
    { replaceDynamicStrings: { '</link>': '' } }
  );
  const { application } = await render(page, { parserOptions: { comment: true } });

  return normalizeSuspense(application);
};
