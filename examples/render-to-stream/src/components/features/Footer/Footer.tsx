import { usePageService } from '@tramvai/module-router';
import { Fragment } from 'react';
import styles from './Footer.css';

export const Footer = () => {
  const pageService = usePageService();
  const ModalComponent = pageService.getComponent('modal') ?? Fragment;

  return (
    <div className={styles.footer}>
      <div>this Footer in render-to-stream</div>
      <ModalComponent />
    </div>
  );
};
