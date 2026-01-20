import type { PageComponent } from '@tramvai/react';
import { useDi } from '@tramvai/react';
import { I18N_TOKEN, I18nStore } from '@tramvai/module-i18n';
import { useRoute, Link } from '@tramvai/module-router';
import { useStoreSelector } from '@tramvai/state';
import { Layout } from '../../../components/Layout';

const ProductDetailPage: PageComponent = () => {
  const i18nService = useDi(I18N_TOKEN);
  const currentLanguage = useStoreSelector(I18nStore, (state) => state.language);
  const route = useRoute();
  const productId = route.params.id;

  const addLanguage = (path: string) => {
    return i18nService.addLanguageToUrl(path, currentLanguage).pathname;
  };

  const products = {
    ru: {
      '1': {
        name: 'Tramvai Framework',
        description: 'Универсальный SSR React фреймворк',
        fullDescription:
          'Tramvai - это полнофункциональный фреймворк для создания серверных React-приложений с отличным разделением кода, гидратацией и производительностью.',
        features: [
          'Серверный рендеринг (SSR)',
          'Разделение кода',
          'Модульная архитектура',
          'Dependency Injection',
          'TypeScript',
        ],
      },
      '2': {
        name: 'I18n Module',
        description: 'Модуль интернационализации',
        fullDescription:
          'Модуль @tramvai/module-i18n предоставляет полную поддержку интернационализации для приложений Tramvai.',
        features: [
          'Автоопределение языка',
          'Несколько стратегий роутинга',
          'Переключение языка',
          'SEO поддержка',
        ],
      },
      '3': {
        name: 'Router Module',
        description: 'Модуль маршрутизации',
        fullDescription:
          'Модуль @tramvai/module-router обеспечивает мощную маршрутизацию для приложений Tramvai с поддержкой SPA и SSR.',
        features: [
          'Файловая система роутинга',
          'Динамические роуты',
          'Вложенные макеты',
          'SPA переходы',
          'Prefetching',
        ],
      },
    },
    en: {
      '1': {
        name: 'Tramvai Framework',
        description: 'Universal SSR React framework',
        fullDescription:
          'Tramvai is a full-featured framework for building server-side React applications with excellent code-splitting, hydration, and performance.',
        features: [
          'Server-side rendering (SSR)',
          'Code splitting',
          'Modular architecture',
          'Dependency Injection',
          'TypeScript',
        ],
      },
      '2': {
        name: 'I18n Module',
        description: 'Internationalization module',
        fullDescription:
          'The @tramvai/module-i18n module provides complete internationalization support for Tramvai applications.',
        features: [
          'Automatic language detection',
          'Multiple routing strategies',
          'Language switching',
          'SEO support',
        ],
      },
      '3': {
        name: 'Router Module',
        description: 'Routing module',
        fullDescription:
          'The @tramvai/module-router module provides powerful routing for Tramvai applications with SPA and SSR support.',
        features: [
          'File-system routing',
          'Dynamic routes',
          'Nested layouts',
          'SPA transitions',
          'Prefetching',
        ],
      },
    },
  };

  const labels = {
    ru: {
      backToProducts: '← Назад к продуктам',
      productId: 'ID продукта',
      description: 'Описание',
      features: 'Особенности',
      notFound: 'Продукт не найден',
    },
    en: {
      backToProducts: '← Back to Products',
      productId: 'Product ID',
      description: 'Description',
      features: 'Features',
      notFound: 'Product not found',
    },
  };

  const langProducts = products[currentLanguage as keyof typeof products] || products.en;
  const product = langProducts[productId as keyof typeof langProducts];
  const t = labels[currentLanguage as keyof typeof labels] || labels.en;

  return (
    <Layout>
      {product ? (
        <>
          <Link
            url={addLanguage('/products/')}
            style={{ display: 'inline-block', marginBottom: '20px', color: '#007bff' }}
          >
            {t.backToProducts}
          </Link>

          <h2>{product.name}</h2>

          <div
            style={{
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px',
            }}
          >
            <strong>{t.productId}:</strong> {productId}
          </div>

          <h3>{t.description}</h3>
          <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '25px' }}>
            {product.fullDescription}
          </p>

          <h3>{t.features}:</h3>
          <ul style={{ lineHeight: '1.8', fontSize: '15px' }}>
            {product.features.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
        </>
      ) : (
        <div>
          <h2>{t.notFound}</h2>
          <Link url={addLanguage('/products/')} style={{ color: '#007bff' }}>
            {t.backToProducts}
          </Link>
        </div>
      )}
    </Layout>
  );
};

ProductDetailPage.seo = {
  metaTags: {
    title: 'Product Detail - i18n Example',
    description: 'Product detail page',
  },
};

export default ProductDetailPage;
