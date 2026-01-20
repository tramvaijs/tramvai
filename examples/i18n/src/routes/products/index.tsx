import type { PageComponent } from '@tramvai/react';
import { useLanguageService } from '@tramvai/module-i18n';
import { Link } from '@tramvai/module-router';
import { Layout } from '../../components/Layout';

const ProductsPage: PageComponent = () => {
  const i18nService = useLanguageService();
  const currentLanguage = i18nService.getLanguage();

  const addLanguage = (path: string) => {
    return i18nService.addLanguageToUrl(path, currentLanguage).pathname;
  };

  const content = {
    ru: {
      title: 'Продукты',
      description: 'Эта страница демонстрирует динамическую маршрутизацию с параметрами URL.',
      clickProduct:
        'Нажмите на продукт, чтобы увидеть детальную страницу с динамическим параметром :id',
      products: [
        { id: '1', name: 'Tramvai Framework', description: 'Универсальный SSR React фреймворк' },
        { id: '2', name: 'I18n Module', description: 'Модуль интернационализации' },
        { id: '3', name: 'Router Module', description: 'Модуль маршрутизации' },
      ],
    },
    en: {
      title: 'Products',
      description: 'This page demonstrates dynamic routing with URL parameters.',
      clickProduct: 'Click on a product to see the detail page with dynamic :id parameter',
      products: [
        { id: '1', name: 'Tramvai Framework', description: 'Universal SSR React framework' },
        { id: '2', name: 'I18n Module', description: 'Internationalization module' },
        { id: '3', name: 'Router Module', description: 'Routing module' },
      ],
    },
  };

  const t = content[currentLanguage as keyof typeof content] || content.en;

  return (
    <Layout>
      <h2>{t.title}</h2>
      <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '25px' }}>{t.description}</p>
      <p
        style={{
          padding: '15px',
          background: '#fff3cd',
          borderLeft: '4px solid #ffc107',
          borderRadius: '4px',
          marginBottom: '25px',
        }}
      >
        {t.clickProduct}
      </p>

      <div style={{ display: 'grid', gap: '15px' }}>
        {t.products.map((product) => (
          <Link
            key={product.id}
            url={addLanguage(`/products/${product.id}/`)}
            style={{
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.2s',
              display: 'block',
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{product.name}</h3>
            <p style={{ margin: 0, color: '#666' }}>{product.description}</p>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

ProductsPage.seo = {
  metaTags: {
    title: 'Products - i18n Example',
    description: 'Products list page',
  },
};

export default ProductsPage;
