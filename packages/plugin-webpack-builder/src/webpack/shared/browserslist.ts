import mapObj from '@tinkoff/utils/object/map';
import browserslist from 'browserslist';
import type { ConfigService } from '@tramvai/api/lib/config';

const EXTENDS_REGEXP = /^extends (.+)$/i;

// преобразуем использование extends в конфиге в явный импорт из target-файла т.к.
// после сборки другие модули уже не будут доступны
const normalizeQuery = (rootDir: string, env: string, query: string[]) => {
  const result: string[] = [];

  for (const entry of query) {
    const match = entry.match(EXTENDS_REGEXP);

    if (match) {
      const [_, name] = match;
      const externalModule = require(require.resolve(name, { paths: [rootDir] }));

      result.push(...normalizeQuery(rootDir, env, externalModule[env] ?? externalModule.defaults));
    } else {
      result.push(entry);
    }
  }

  return result;
};

// Reads the browserslist config during build and converts it to a format that won't crash due to dynamic imports in runtime.
export const normalizeBrowserslistConfig = (config: ConfigService) => {
  const { rootDir } = config;

  const browserslistConfig = browserslist.findConfig(rootDir);

  if (!browserslistConfig) {
    return {};
  }

  const normalizedConfig = mapObj(
    (query, env) => normalizeQuery(rootDir, env, query!),
    browserslistConfig
  );

  return normalizedConfig;
};
