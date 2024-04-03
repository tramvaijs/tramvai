export type TestVersion =
  | 'latest' // latest dev version from the current tramvai repo state
  | 'v2.0.0' // for checking compatibility with the most outdated version
  | 'v3.0.1'; // first new major version after one where introduced more flexible tramvai versions for module federation sharing

export type TestCase = {
  rootAppVersion: TestVersion;
  childAppsVersion: TestVersion;
  router: { prefetchScriptsCount: number; nonBlockingSpa: boolean };
  reactQuery: { scriptsCount: number };
};

export const testCasesConditions: Record<string, TestCase> = {
  'latest-latest': {
    rootAppVersion: 'latest',
    childAppsVersion: 'latest',
    router: {
      prefetchScriptsCount: 2, // main file and entry point
      nonBlockingSpa: true, // latest root-app has updated code to support non-blocking loading on spa navigations
    },
    reactQuery: {
      scriptsCount: 2, // only runtime and main entry chunk should be loaded, while others should be shared
    },
  },
  'v2.0.0-latest': {
    rootAppVersion: 'v2.0.0',
    childAppsVersion: 'latest',
    router: {
      prefetchScriptsCount: 0, // there is not available prefetch manager in root-app so not prefetching at all
      nonBlockingSpa: false, // old versions will block on spa while child-app is loading
    },
    reactQuery: {
      scriptsCount: 7, // no dependencies are shared so every dep should be loaded for child-app
    },
  },
  'latest-v2.0.0': {
    rootAppVersion: 'latest',
    childAppsVersion: 'v2.0.0',
    router: {
      prefetchScriptsCount: 0, // there is no router link with prefetch in old child-app
      nonBlockingSpa: true, // latest root-app has updated code to support non-blocking loading on spa navigations
    },
    reactQuery: {
      scriptsCount: 1, // old child-app are built in single file
    },
  },
  'latest-v3.0.1': {
    rootAppVersion: 'latest',
    childAppsVersion: 'v3.0.1',
    router: {
      prefetchScriptsCount: 2, // versions that has support for prefetch in routing
      nonBlockingSpa: true, // latest root-app has updated code to support non-blocking loading on spa navigations
    },
    reactQuery: {
      // NOTE: it requires to have semver versions in package.jsons in repo not stub versions
      scriptsCount: 2, // only runtime and main entry chunk should be loaded, while others should be shared
    },
  },
};
