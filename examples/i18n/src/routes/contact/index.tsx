import type { PageComponent } from '@tramvai/react';
import { useDi } from '@tramvai/react';
import { I18N_TOKEN, I18nStore } from '@tramvai/module-i18n';
import { useStore } from '@tramvai/state';
import { Layout } from '../../components/Layout';
import { useUrl } from '@tramvai/module-router';

const ContactPage: PageComponent = () => {
  const i18nService = useDi(I18N_TOKEN);
  const currentUrl = useUrl();
  const languageFromUrl = i18nService.getLanguageFromUrl(currentUrl.href);
  const { language: currentLanguage, source: languageSource } = useStore(I18nStore);

  const content = {
    ru: {
      title: 'Контакты',
      description: 'Эта страница демонстрирует, как работает маршрутизация с i18n модулем.',
      urlExample: 'Пример URL',
      currentUrl: 'Текущий URL',
      detectInfo: 'Информация об определении языка',
      languageFrom: 'Язык определен из',
      cookieValue: 'Значение cookie',
      urlPrefix: 'Префикс языка в URL',
    },
    en: {
      title: 'Contact',
      description: 'This page demonstrates how routing works with the i18n module.',
      urlExample: 'URL Example',
      currentUrl: 'Current URL',
      detectInfo: 'Language Detection Info',
      languageFrom: 'Language detected from',
      cookieValue: 'Cookie value',
      urlPrefix: 'Language prefix in URL',
    },
  };

  const t = content[currentLanguage as keyof typeof content] || content.en;

  return (
    <Layout>
      <h2>{t.title}</h2>
      <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '25px' }}>{t.description}</p>

      <div
        style={{
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '4px',
          marginBottom: '20px',
        }}
      >
        <h3>{t.detectInfo}:</h3>
        <table style={{ width: '100%', marginTop: '15px', fontSize: '14px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>{t.currentUrl}:</td>
              <td style={{ padding: '8px', fontFamily: 'monospace' }}>{currentUrl.pathname}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>{t.urlPrefix}:</td>
              <td style={{ padding: '8px', fontFamily: 'monospace' }}>
                {languageFromUrl || 'null'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>{t.languageFrom}:</td>
              <td style={{ padding: '8px' }}>{languageSource}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>{t.urlExample}:</h3>
      <ul style={{ lineHeight: '1.8', fontSize: '14px', fontFamily: 'monospace' }}>
        <li>prefix_except_default: / (default), /en/</li>
        <li>prefix: /ru/, /en/</li>
        <li>prefix_and_default: / or /ru/, /en/</li>
        <li>no_prefix: / (all languages)</li>
      </ul>
    </Layout>
  );
};

ContactPage.seo = {
  metaTags: {
    title: 'Contact - i18n Example',
    description: 'Contact page with routing information',
  },
};

export default ContactPage;
