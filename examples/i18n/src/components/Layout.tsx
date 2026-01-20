import { useDi } from '@tramvai/react';
import { I18N_CONFIGURATION_TOKEN, I18N_TOKEN, I18nStore } from '@tramvai/module-i18n';
import { Link } from '@tramvai/module-router';
import { useStoreSelector } from '@tramvai/state';
import { LanguageSwitcher } from './LanguageSwitcher';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const i18nService = useDi(I18N_TOKEN);
  const config = useDi(I18N_CONFIGURATION_TOKEN);
  const currentLanguage = useStoreSelector(I18nStore, (state) => state.language);

  const addLanguage = (path: string) => {
    return i18nService.addLanguageToUrl(path, currentLanguage).pathname;
  };

  const translations = {
    ru: {
      home: 'Главная',
      about: 'О нас',
      contact: 'Контакты',
      products: 'Продукты',
      appTitle: 'Пример приложения с i18n',
      currentLang: 'Текущий язык',
      routingStrategy: 'Стратегия роутинга',
      updateStrategy: 'Стратегия обновления',
    },
    en: {
      home: 'Home',
      about: 'About',
      contact: 'Contact',
      products: 'Products',
      appTitle: 'i18n Example Application',
      currentLang: 'Current Language',
      routingStrategy: 'Routing Strategy',
      updateStrategy: 'Update Strategy',
    },
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t.appTitle}</h1>
        <LanguageSwitcher />
      </header>

      <nav className={styles.nav}>
        <Link url={addLanguage('/')} className={styles.navLink}>
          {t.home}
        </Link>
        <Link url={addLanguage('/about/')} className={styles.navLink}>
          {t.about}
        </Link>
        <Link url={addLanguage('/contact/')} className={styles.navLink}>
          {t.contact}
        </Link>
        <Link url={addLanguage('/products/')} className={styles.navLink}>
          {t.products}
        </Link>
      </nav>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.info}>
          <div>
            <strong>{t.currentLang}:</strong> {currentLanguage}
          </div>
          <div>
            <strong>{t.routingStrategy}:</strong> {config.routingStrategy}
          </div>
          <div>
            <strong>{t.updateStrategy}:</strong> {config.updateStrategy}
          </div>
        </div>
      </footer>
    </div>
  );
};
