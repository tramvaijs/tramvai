/**
 * Validates that Service Worker scopes unique
 * Scopes can overlap, then most specific choosen
 * scopes = ['/scope/', '/scope/bank/']
 * /scope - /scope/
 * /scope/route - /scope/
 * /scope/bank/ - /scope/bank/
 *
 * @param scopes - Array of scope strings to validate
 * @throws Error if equal scopes are detected
 */
export const validateSwScopesOverlap = (scopes: string[]) => {
  if (!scopes || scopes.length <= 1) {
    return;
  }

  // Normalize scopes: ensure they start and end with /
  const normalizedScopes = scopes.map((scope) => {
    let normalized = scope;

    if (!normalized.startsWith('/')) {
      normalized = `/${normalized}`;
    }

    if (!normalized.endsWith('/')) {
      normalized = `${normalized}/`;
    }

    return normalized;
  });

  const overlaps: string[] = [];

  for (let i = 0; i < normalizedScopes.length; i++) {
    for (let j = i + 1; j < normalizedScopes.length; j++) {
      const scopeA = normalizedScopes[i];
      const scopeB = normalizedScopes[j];

      if (scopeA === scopeB) {
        overlaps.push(scopeA);
      }
    }
  }

  if (overlaps.length > 0) {
    throw new Error(
      `Service Worker scopes overlap, which can cause unpredictable behavior: ${overlaps.join(', ')}\nEach scope should be unique.`
    );
  }
};
