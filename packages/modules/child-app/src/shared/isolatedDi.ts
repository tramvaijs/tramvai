import type { ExtractDependencyType } from '@tinkoff/dippy';
import type {
  CHILD_APP_ROOT_DI_ACCESS_MODE_TOKEN,
  ChildAppFinalConfig,
} from '@tramvai/tokens-child-app';

export const shouldIsolateDi = (
  config: ChildAppFinalConfig,
  rootDiAccessMode: ExtractDependencyType<typeof CHILD_APP_ROOT_DI_ACCESS_MODE_TOKEN>
): boolean => {
  const { name } = config;

  return rootDiAccessMode.mode === 'blacklist'
    ? rootDiAccessMode.list.includes(name)
    : !rootDiAccessMode.list.includes(name);
};
