import once from '@tinkoff/utils/function/once';
import semver from 'semver';
import { sync as resolve } from 'resolve';

export const resolveReactVersion = once(() => {
  const reactVersion = require('react').version;

  return semver.parse(reactVersion);
});

export function hasJsxRuntime() {
  try {
    resolve('react/jsx-runtime', { basedir: process.cwd() });
    return true;
  } catch (e) {
    return false;
  }
}

// reference https://github.com/vercel/next.js/blob/canary/packages/next/server/config.ts#L736
export const shouldUseReactRoot = once(() => {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const reactVersion = require('react').version;
  const isReactExperimental = reactVersion && /0\.0\.0-experimental/.test(reactVersion);
  const hasReact18orHigher =
    reactVersion &&
    (semver.gte(reactVersion, '18.0.0') || semver.coerce(reactVersion)?.version === '18.0.0');

  return Boolean(hasReact18orHigher || isReactExperimental);
});
