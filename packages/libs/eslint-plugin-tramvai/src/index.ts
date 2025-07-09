import path from 'node:path';
// @ts-ignore
import { getRules } from '@automattic/eslint-config-target-es/functions';

import { defaults as defaultBrowserslistConfig } from '@tinkoff/browserslist-config';

import { Rules } from './types';
import {
  resolveBrowserslistConfig,
  patchRules,
  getUsedPolyfillsPathsFromLibrary,
  getUsedPolyfillsPathsFromProject,
  getLibraryEslintConfig,
} from './utils';
import { disabledRules } from './rulesMap';

const defaultEslintPluginEsXRules = getRules({ query: defaultBrowserslistConfig });

// Disable transpiling rules
disabledRules.forEach((ruleName) => {
  defaultEslintPluginEsXRules[ruleName] = 0;
});

const defaultCompatConfig = getCompatConfig(defaultEslintPluginEsXRules);

function getCompatConfig(
  rules: Rules,
  browserslist: string[] = [],
  customEslintConfig: {
    settings: { polyfills: string[] };
    rules: Record<string, string>;
  } = {
    settings: { polyfills: [] },
    rules: {},
  }
) {
  return {
    plugins: ['es-x', 'compat'],
    rules: {
      ...rules,
      ...customEslintConfig.rules,
      'compat/compat': 'error',
    },
    settings: {
      ...(browserslist.length > 0 ? { targets: browserslist } : {}),
      lintAllEsApis: false,
      polyfills: ['Promise', 'URL', 'URLSearchParams', ...customEslintConfig.settings.polyfills],
    },
  };
}

const recommendedConfig = {
  plugins: ['@tinkoff/tramvai'],
  rules: {
    '@tinkoff/tramvai/bundle-chunk-name': 'error',
    '@tinkoff/tramvai/no-lambda-fn-in-action': 'error',
    '@tinkoff/tramvai/no-empty-image-sizes-attribute': 'warn',
    'spaced-comment': 'off',
  },
};

const pluginCustomRules = {
  'bundle-chunk-name': require('./rules/bundle-chunk-name').rule,
  'no-lambda-fn-in-action': require('./rules/no-lambda-fn-in-actions').rule,
  'no-empty-image-sizes-attribute': require('./rules/no-empty-image-sizes-attribute').rule,
};

function getOptionsFromProjectRoot(projectRoot: string) {
  const customBrowserslistConfig = resolveBrowserslistConfig(projectRoot);
  const customEslintPluginEsXRules = getRules({
    query: customBrowserslistConfig ?? defaultBrowserslistConfig,
  });
  const customPolyfillsPaths = getUsedPolyfillsPathsFromProject(projectRoot);

  return { customEslintPluginEsXRules, customPolyfillsPaths, customBrowserslistConfig };
}

function getOptionsFromLibrary(libraryName: string, projectRoot?: string) {
  const libraryRoot = path.dirname(
    require.resolve(libraryName, projectRoot ? { paths: [projectRoot] } : {})
  );

  const customBrowserslistConfig = resolveBrowserslistConfig(libraryRoot);
  const customEslintPluginEsXRules = getRules({
    query: customBrowserslistConfig ?? defaultBrowserslistConfig,
  });
  const customPolyfillsPaths = getUsedPolyfillsPathsFromLibrary(libraryRoot);

  return { customEslintPluginEsXRules, customPolyfillsPaths, customBrowserslistConfig };
}

function getCustomEslintPlugin(rootOrLibrary: string, projectRoot?: string) {
  if (!rootOrLibrary) {
    throw new Error('Не указан путь для генерации кастомного eslint-plugin-tramvai');
  }

  const isProjectRootAbsolute = path.isAbsolute(rootOrLibrary);

  const { customEslintPluginEsXRules, customPolyfillsPaths, customBrowserslistConfig } =
    isProjectRootAbsolute
      ? getOptionsFromProjectRoot(rootOrLibrary)
      : getOptionsFromLibrary(rootOrLibrary, projectRoot);

  patchRules(customPolyfillsPaths, customEslintPluginEsXRules);
  const compatConfig = getCompatConfig(
    customEslintPluginEsXRules,
    customBrowserslistConfig ?? defaultBrowserslistConfig,
    isProjectRootAbsolute ? undefined : getLibraryEslintConfig(rootOrLibrary, projectRoot)
  );

  return {
    rules: pluginCustomRules,
    configs: {
      compat: compatConfig,
      recommended: recommendedConfig,
    },
  };
}

module.exports = {
  getCustomEslintPlugin,
  rules: pluginCustomRules,
  configs: {
    compat: defaultCompatConfig,
    recommended: recommendedConfig,
  },
};
