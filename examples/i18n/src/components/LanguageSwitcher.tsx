import { useStoreSelector } from '@tramvai/state';
import { useDi } from '@tramvai/react';
import { I18N_TOKEN, I18nStore } from '@tramvai/module-i18n';
import styles from './LanguageSwitcher.module.css';

export const LanguageSwitcher = () => {
  const i18nService = useDi(I18N_TOKEN);
  const currentLanguage = useStoreSelector(I18nStore, (state) => state.language);
  const availableLanguages = useStoreSelector(I18nStore, (state) => state.availableLanguages);

  const handleChange = (lang: string) => {
    i18nService.switchLanguage(lang);
  };

  const languageNames: Record<string, string> = {
    ru: 'Русский',
    en: 'English',
  };

  return (
    <div className={styles.switcher}>
      <label htmlFor="language-select" className={styles.label}>
        Language:
      </label>
      <select
        id="language-select"
        value={currentLanguage}
        onChange={(e) => handleChange(e.target.value)}
        className={styles.select}
      >
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {languageNames[lang] || lang.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
};
