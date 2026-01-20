import type { PageComponent } from '@tramvai/react';
import { useStoreSelector } from '@tramvai/state';
import { I18nStore } from '@tramvai/module-i18n';
import { Layout } from '../../components/Layout';

const AboutPage: PageComponent = () => {
  const currentLanguage = useStoreSelector(I18nStore, (state) => state.language);

  const content = {
    ru: {
      title: 'О нас',
      intro: 'Этот пример демонстрирует возможности модуля @tramvai/module-i18n.',
      whatIsI18n: 'Что такое i18n?',
      whatIsI18nText:
        'i18n (интернационализация) - это процесс разработки приложений, которые могут легко адаптироваться к различным языкам и регионам без изменения кода.',
      moduleFeatures: 'Возможности модуля',
      features: [
        'Определение языка на основе приоритетов',
        'Несколько стратегий маршрутизации URL',
        'Переключение языка с перезагрузкой или SPA-переходом',
        'Интеграция с роутером Tramvai',
        'Автоматические SEO-теги для многоязычных страниц',
      ],
    },
    en: {
      title: 'About',
      intro: 'This example demonstrates the capabilities of the @tramvai/module-i18n module.',
      whatIsI18n: 'What is i18n?',
      whatIsI18nText:
        'i18n (internationalization) is the process of developing applications that can easily be adapted to different languages and regions without code changes.',
      moduleFeatures: 'Module Features',
      features: [
        'Language detection based on priorities',
        'Multiple URL routing strategies',
        'Language switching with reload or SPA transition',
        'Integration with Tramvai router',
        'Automatic SEO tags for multi-language pages',
      ],
    },
  };

  const t = content[currentLanguage as keyof typeof content] || content.en;

  return (
    <Layout>
      <h2>{t.title}</h2>
      <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '25px' }}>{t.intro}</p>

      <h3>{t.whatIsI18n}</h3>
      <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '25px' }}>
        {t.whatIsI18nText}
      </p>

      <h3>{t.moduleFeatures}:</h3>
      <ul style={{ lineHeight: '1.8', fontSize: '15px' }}>
        {t.features.map((feature, idx) => (
          <li key={idx}>{feature}</li>
        ))}
      </ul>
    </Layout>
  );
};

AboutPage.seo = {
  metaTags: {
    title: 'About - i18n Example',
    description: 'About the i18n example application',
  },
};

export default AboutPage;
