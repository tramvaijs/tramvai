export function retryAssets(
  retryMap: Record<string, string>,
  getRetryUrl: (url: string, retryMap: Record<string, string>) => string,
  assetsPrefix: string | null
) {
  const retryLimit = 1;
  const retryCountByUrl: Map<string, number> = new Map();

  window.addEventListener(
    'error',
    function retryAssetsHandler(event) {
      if (!event.target) {
        return;
      }

      if (event.target instanceof HTMLScriptElement) {
        retryScript(event.target);
      } else if (event.target instanceof HTMLLinkElement) {
        retryLink(event.target);
      }
    },
    true
  );

  // eslint-disable-next-line max-statements
  function retryScript(tag: HTMLScriptElement) {
    if (!isCriticalAsset(tag, tag.src)) {
      return;
    }

    const retryUrl = getRetryUrl(tag.src, retryMap);

    if (!retryCycleCheck(retryUrl)) {
      return;
    }

    const newTag = document.createElement('script');
    const error = new Error(`Problem with the file loading: ${tag.src}`);

    Object.assign(error, {
      code: 'ASSET_LOAD_FAIL',
      originalUrl: tag.src,
      newUrl: retryUrl,
    });

    applyCommonAttributes(tag, newTag);

    // for async scripts waiting logic, e.g. microfrontends
    newTag.dataset.src = tag.src;
    newTag.type = 'text/javascript';

    const xhr = new XMLHttpRequest();

    try {
      // synchronous (main thread blocking) retry request
      xhr.open('GET', retryUrl, false);
      xhr.send();

      if (xhr.status >= 200 && xhr.status < 300) {
        newTag.text = xhr.responseText;
        newTag.setAttribute('loaded', 'true');

        Object.assign(error, {
          retry: 'success',
        });

        setTimeout(() => {
          // TODO: prevent webpack overlay show
          throw error;
        }, 0);
      } else {
        newTag.setAttribute('loaded', 'error');

        Object.assign(error, {
          retry: 'failed',
          xhrStatus: xhr.status,
          xhrMessage: xhr.responseText,
        });

        // NOTE: the error is delivered asynchronously, so application monitoring defers its
        // `critical-assets-*` verdict with its own `setTimeout` on `load` to make sure this
        // throw is observed first
        // (packages/modules/application-monitoring/src/inlineReporters/events/errorMonitoringScript.inline.ts)
        setTimeout(() => {
          // TODO: prevent webpack overlay show
          throw error;
        }, 0);
      }
    } catch (xhrError) {
      newTag.setAttribute('loaded', 'error');

      Object.assign(error, {
        retry: 'failed',
        xhrStatus: xhr.status,
        xhrMessage: xhrError.message,
      });

      setTimeout(() => {
        // TODO: prevent webpack overlay show
        throw error;
      }, 0);
    }

    // retry has settled (success or failure) - allow this url to be retried again later,
    // e.g. on a subsequent SPA navigation that requests the same chunk
    retryCountByUrl.delete(retryUrl);

    replaceTag(tag, newTag);
  }

  function retryLink(tag: HTMLLinkElement) {
    if (tag.rel !== 'stylesheet') {
      return;
    }
    if (!isCriticalAsset(tag, tag.href)) {
      return;
    }

    const retryUrl = getRetryUrl(tag.href, retryMap);

    if (!retryCycleCheck(retryUrl)) {
      return;
    }

    const newTag = document.createElement('link');
    const error = new Error(`Problem with the file loading: ${tag.href}`);

    Object.assign(error, {
      code: 'ASSET_LOAD_FAIL',
      originalUrl: tag.href,
      newUrl: retryUrl,
    });

    applyCommonAttributes(tag, newTag);

    // mini-css-extract-plugin's `findStylesheet` identifies an in-flight chunk by
    // `getAttribute('data-href') || getAttribute('href')`, so `data-href` must hold the
    // original url to prevent a duplicate load while the fallback link is still in flight.
    newTag.dataset.href = tag.href;
    newTag.href = retryUrl;
    newTag.rel = 'stylesheet';
    newTag.crossOrigin = 'anonymous';

    newTag.addEventListener('load', () => {
      newTag.setAttribute('loaded', 'true');
      Object.assign(error, {
        retry: 'success',
      });

      // retry has settled - allow this url to be retried again later,
      // e.g. on a subsequent SPA navigation that requests the same chunk
      retryCountByUrl.delete(retryUrl);

      // TODO: prevent webpack overlay show
      throw error;
    });
    newTag.addEventListener('error', () => {
      newTag.setAttribute('loaded', 'error');

      Object.assign(error, {
        retry: 'failed',
      });

      // retry has settled - allow this url to be retried again later,
      // e.g. on a subsequent SPA navigation that requests the same chunk
      retryCountByUrl.delete(retryUrl);

      setTimeout(() => {
        // allow a later retry of the failed CSS chunk.
        //
        // Unlike the script branch, the failed link tag has to be removed and not just
        // stripped of an attribute: `findStylesheet` in the mini-css-extract-plugin runtime
        // matches on `getAttribute('data-href') || getAttribute('href')`, and once `data-href`
        // is deleted the fallback `href` is still there. When no fallback host is configured
        // for the asset the retry url equals the original one, so a surviving tag would match,
        // `loadStylesheet` would resolve immediately and the chunk would never be requested
        // again - the page would silently lose its styles.
        delete newTag.dataset.href;

        newTag.remove();
      }, 0);

      // TODO: prevent webpack overlay show
      throw error;
    });

    replaceTag(tag, newTag);
  }

  function isCriticalAsset(tag: HTMLScriptElement | HTMLLinkElement, url: string) {
    // `data-critical` is set by the server for SSR assets, by ScriptCriticalAttributePlugin for
    // runtime-loaded scripts, and via mini-css-extract-plugin `attributes` for CSS chunks.
    //
    // The `assetsPrefix` branch is kept as a safety net for assets served from the app's own
    // origin that do not carry `data-critical` for any reason.
    return !!tag.dataset.critical || (!!assetsPrefix && url.indexOf(assetsPrefix) === 0);
  }

  function retryCycleCheck(retryUrl: string): boolean {
    if (!retryCountByUrl.has(retryUrl)) {
      retryCountByUrl.set(retryUrl, 1);
      return true;
    }
    if (retryCountByUrl.get(retryUrl)! < retryLimit) {
      retryCountByUrl.set(retryUrl, retryCountByUrl.get(retryUrl)! + 1);
      return true;
    }
    return false;
  }

  function applyCommonAttributes(
    sourceElement: HTMLLinkElement | HTMLScriptElement,
    element: HTMLLinkElement | HTMLScriptElement
  ) {
    // integrity will not working for inline script after xhr retry
    if (sourceElement.integrity) {
      element.integrity = sourceElement.integrity;
    }

    for (const key in sourceElement.dataset) {
      // Skip bundler-specific attributes — they must not be propagated to the retry tag.
      // The fallback script is inline (no `src`) so the webpack runtime would match it
      // via `data-webpack` / `data-rspack` and attach handlers to a tag that never loads.
      if (key === 'webpack' || key === 'rspack') {
        continue;
      }
      element.dataset[key] = sourceElement.dataset[key];
    }
  }

  function replaceTag(tag: HTMLElement, newTag: HTMLElement) {
    tag.before(newTag);
    tag.remove();
  }
}
