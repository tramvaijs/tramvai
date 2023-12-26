import type { PageComponent } from '@tramvai/react';
import styles from './index.module.css';

export const MainPage: PageComponent = () => {
  return (
    <>
      <h2 className={styles.title}>Main Page</h2>
    </>
  );
};

MainPage.seo = {
  metaTags: {
    title: 'Main Page Title',
  },
};

// eslint-disable-next-line import/no-default-export
export default MainPage;
