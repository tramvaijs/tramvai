import type { PageComponent } from '@tramvai/react';
import { useStoreSelector } from '@tramvai/state';
import { I18nStore } from '@tramvai/module-i18n';
import { Layout } from '../components/Layout';

const DefaultPage: PageComponent = () => {
  const currentLanguage = useStoreSelector(I18nStore, (state) => state.language);

  const content = {
    ru: {
      title: 'Страница из админки',
    },
    en: {
      title: 'Admin page',
    },
  };

  const t = content[currentLanguage as keyof typeof content] || content.en;

  return (
    <Layout>
      <h2>{t.title}</h2>
    </Layout>
  );
};

DefaultPage.seo = {
  metaTags: {
    title: 'Admin page - i18n Example',
    description: 'Some admin page for the i18n example application',
  },
};

export default DefaultPage;
