/**
 * Add link-element to the document head
 *
 * @param type rel attribute of link-element
 * @param href href attribute of link-element
 */
export const addLink = (
  type: string,
  href: string,
  attrs = {},
  options: { resolveOnFailed?: boolean } = {}
) => {
  const link = document.createElement('link');

  Object.assign(link, attrs, {
    rel: type,
    href,
  });

  link.dataset.critical = 'true';

  return new Promise<any>((resolve, reject) => {
    link.onerror = (error) => {
      if (options.resolveOnFailed) {
        return resolve(error);
      }

      // try to find a fallback link if the main link fails
      const fallback = document.querySelector(`[data-href="${href}"]`);

      if (fallback) {
        return resolve(error);
      }

      return reject(new Error(`could not load link ${href}`));
    };

    if ('onload' in link) {
      link.onload = resolve;
    } else {
      setTimeout(resolve, 50);
    }

    document.head.appendChild(link);
  });
};
