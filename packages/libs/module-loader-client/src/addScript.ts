/**
 * Add script-element to the document head
 *
 * @param {string} src src attribute of script-element
 * @param {Object} [attrs={}] attributes to set to new script object
 * @param {Function} [cb] option callback which synchronously invoked just created script tag
 */
export const addScript = (
  src: string,
  attrs = {},
  cb?: (scriptElement: HTMLScriptElement) => void
) => {
  const script = document.createElement('script');

  Object.assign(script, attrs, {
    async: true,
    src,
  });

  script.dataset.critical = 'true';

  if (cb) {
    cb(script);
  }

  return new Promise<any>((resolve, reject) => {
    script.onerror = (err) => {
      // try to find a fallback script if the main script fails
      const fallback = document.querySelector(`[data-src="${src}"]`);

      if (fallback && fallback.getAttribute('loaded') === 'true') {
        return resolve(err);
      }

      reject(new Error(`could not load script ${src} ${(err as any).message || err}`));
    };

    script.onload = resolve;

    document.head.appendChild(script);
  });
};
