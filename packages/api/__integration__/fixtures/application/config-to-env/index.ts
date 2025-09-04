console.log(
  `enableFsPages ${process.env.__TRAMVAI_EXPERIMENTAL_ENABLE_FILE_SYSTEM_PAGES}`,
  process.env.__TRAMVAI_EXPERIMENTAL_FILE_SYSTEM_ROUTES_DIR,
  process.env.__TRAMVAI_EXPERIMENTAL_FILE_SYSTEM_PAGES_DIR,
  process.env.ENV_FROM_OPTIONS,
  `enableConcurrentFeatures ${process.env.__TRAMVAI_CONCURRENT_FEATURES}`,
  `enableViewTransitions ${process.env.__TRAMVAI_VIEW_TRANSITIONS}`,
  `enableReactTransitions ${process.env.__TRAMVAI_REACT_TRANSITIONS}`,
  process.env.NODE_ENV,
  process.env.APP_ID,
  `isBrowser ${process.env.BROWSER}`,
  `isServer ${process.env.SERVER}`,
  `typeof window ${typeof window}`
);
