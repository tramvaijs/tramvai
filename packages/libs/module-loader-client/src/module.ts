import find from '@tinkoff/utils/array/find';
import { addLink } from './addLink';
import { addScript } from './addScript';
import type { LoadModuleOptions } from './types.h';

const normalizeUrl = (url: string) => url?.replace(/^https?:/, '');

const findLoadingScript = (url: string) =>
  find((script) => {
    const isSameScript = !!script.src && (script.src === url || normalizeUrl(script.src) === url);
    const isSameFallback =
      !!script.dataset.src &&
      (script.dataset.src === url || normalizeUrl(script.dataset.src) === url);

    return isSameScript || isSameFallback;
  }, document.scripts);

const findLoadingStyle = (url: string) =>
  find(
    (style) => !!style.href && (style.href === url || normalizeUrl(style.href) === url),
    document.styleSheets
  );

// если найден тег link с url в атрибуте data-href,
// это означает что стили были загружены inline, и не нужно грузить файл стилей повторно
const findLazyLoadingStyle = (url: string) => document.querySelector(`[data-href="${url}"]`);

// подразумевается что модуль уже может быть поставлен на загрузку во время ssr
// при этом загрузчик добавил onload/onerror хандлеры, которые проставляют атрибут loaded
export function loadModule(jsUrl: string, options: LoadModuleOptions = {}): Promise<unknown> {
  const script = findLoadingScript(jsUrl); // check if we loading script right now, preserves double loading

  if (script) {
    const loadedAttr = script.getAttribute('loaded');
    if (loadedAttr === 'true') {
      return Promise.resolve();
    }
    if (loadedAttr === 'error') {
      const loadingStyleNode = findLoadingStyle(options.cssUrl ?? '');
      const lazyLoadingStyle = findLazyLoadingStyle(options.cssUrl ?? '');

      script.remove();
      loadingStyleNode?.ownerNode?.remove();
      lazyLoadingStyle?.remove();
    } else {
      return new Promise((resolve, reject) => {
        script.addEventListener('load', resolve);
        script.addEventListener('error', reject);
      });
    }
  }

  const addHandlers = (scriptElement: HTMLScriptElement) => {
    scriptElement.addEventListener('load', () => scriptElement.setAttribute('loaded', 'true'));
    scriptElement.addEventListener('error', () => scriptElement.setAttribute('loaded', 'error'));
  };

  return Promise.all([
    addScript(jsUrl, { crossOrigin: 'anonymous' }, addHandlers),
    options.cssUrl && !findLoadingStyle(options.cssUrl) && !findLazyLoadingStyle(options.cssUrl)
      ? addLink(
          'stylesheet',
          options.cssUrl,
          { crossOrigin: 'anonymous' },
          { resolveOnFailed: options.resolveOnCssFailed }
        )
      : Promise.resolve(),
  ]);
}

export function waitModule(jsUrl: string) {
  const script = findLoadingScript(jsUrl);

  if (script) {
    const loadedAttr = script.getAttribute('loaded');
    if (loadedAttr) {
      return loadedAttr === 'true' ? Promise.resolve() : Promise.reject();
    }

    return new Promise((resolve, reject) => {
      script.addEventListener('load', resolve);
      script.addEventListener('error', reject);
    });
  }

  return Promise.reject();
}
