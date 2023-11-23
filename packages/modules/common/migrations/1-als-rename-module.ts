// eslint-disable-next-line import/no-extraneous-dependencies
import type { Api } from '@tramvai/tools-migrate';
// eslint-disable-next-line no-restricted-imports, import/no-extraneous-dependencies
import { replaceDependency } from '@tramvai/tools-migrate/lib/dependency';

// eslint-disable-next-line import/no-default-export
export default async (api: Api) => {
  await api.transform(({ source }, { j }, { printOptions }) => {
    const parsed = j(source);

    if (
      parsed.renameImportSource(
        '@tramvai-tinkoff/module-async-local-storage',
        '@tramvai/module-common'
      )
    ) {
      return parsed.toSource(printOptions);
    }
  });

  const packageJSON = api.packageJSON.source;

  replaceDependency({
    packageJSON,
    from: '@tramvai-tinkoff/module-async-local-storage',
  });
};
