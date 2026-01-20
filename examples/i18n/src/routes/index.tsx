import type { PageComponent } from '@tramvai/react';
import { I18nStore } from '@tramvai/module-i18n';
import { useStoreSelector } from '@tramvai/state';
import { Layout } from '../components/Layout';

const HomePage: PageComponent = () => {
  const currentLanguage = useStoreSelector(I18nStore, (state) => state.language);

  const content = {
    ru: {
      title: 'Добро пожаловать!',
      description:
        'Это пример приложения на Tramvai с поддержкой интернационализации (i18n). Приложение демонстрирует различные функции модуля @tramvai/module-i18n.',
      features: 'Функции',
      featuresList: [
        'Автоматическое определение языка на основе cookies, заголовков браузера и URL',
        'Несколько стратегий маршрутизации (prefix, prefix_except_default, prefix_and_default, no_prefix)',
        'Переключение языка с сохранением в cookies',
      ],
      tryIt:
        'Попробуйте переключить язык с помощью переключателя выше и перейти по разным страницам!',
    },
    en: {
      title: 'Welcome!',
      description:
        'This is a Tramvai example application with internationalization (i18n) support. The application demonstrates various features of the @tramvai/module-i18n module.',
      features: 'Features',
      featuresList: [
        'Automatic language detection based on cookies, browser headers, and URL',
        'Multiple routing strategies (prefix, prefix_except_default, prefix_and_default, no_prefix)',
        'Language switching with cookie persistence',
      ],
      tryIt:
        'Try switching the language using the switcher above and navigate through different pages!',
    },
  };

  const t = content[currentLanguage as keyof typeof content] || content.en;

  return (
    <Layout>
      <h2>{t.title}</h2>
      <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>{t.description}</p>

      <h3>{t.features}:</h3>
      <ul style={{ lineHeight: '1.8', fontSize: '15px' }}>
        {t.featuresList.map((feature, idx) => (
          <li key={idx}>{feature}</li>
        ))}
      </ul>

      <p
        style={{
          marginTop: '30px',
          padding: '15px',
          background: '#e7f3ff',
          borderLeft: '4px solid #007bff',
          borderRadius: '4px',
        }}
      >
        {t.tryIt}
      </p>
    </Layout>
  );
};

HomePage.seo = {
  metaTags: {
    title: 'Home - i18n Example',
    description: 'Tramvai i18n example application',
  },
};

export default HomePage;
