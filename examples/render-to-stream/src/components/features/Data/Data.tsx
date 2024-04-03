import styles from './Data.css';

let initialRender = false;

export const Data = ({ data }: { data: string }) => {
  if (!initialRender) {
    initialRender = true;

    if (typeof window !== 'undefined') {
      window.performance.mark('dataFirstRender');
      window.performance.measure('dataRenderTime', 'navigationStart', 'dataFirstRender');
    }
  }
  return <div className={styles.data}>{data}</div>;
};

export default Data;
