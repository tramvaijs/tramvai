import type { PropsWithChildren } from 'react';
import styles from './Title.css';

export const Title = ({ children }: PropsWithChildren) => {
  return <h3 className={styles.title}>{children}</h3>;
};

export default Title;
