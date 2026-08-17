import React from 'react';
import styles from './index.module.css';

const BankPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bank Section</h1>
      <p>This page uses the bank Service Worker with scope /bank/</p>
    </div>
  );
};

export default BankPage;
