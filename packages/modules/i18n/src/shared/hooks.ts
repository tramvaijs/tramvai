import { useDi } from '@tramvai/react';
import { useStore } from '@tramvai/state';
import { I18N_TOKEN } from '../tokens';
import { I18nService } from '../types';
import { I18nStore } from './store';

export const useLanguageService = (): I18nService => {
  // force sync language state with service usage
  useStore(I18nStore);

  const i18nService = useDi(I18N_TOKEN);

  return i18nService;
};
