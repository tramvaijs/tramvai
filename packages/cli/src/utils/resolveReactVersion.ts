import once from '@tinkoff/utils/function/once';
import semver from 'semver';

export const resolveReactVersion = once(() => {
  const reactVersion = require('react').version;

  return semver.parse(reactVersion);
});
