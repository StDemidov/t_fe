import styles from './style.module.css';

const FooterWBStocks = ({ data }) => {
  return (
    <div className={styles.cell}>
      {data
        .reduce((n, { lastWBstock }) => n + lastWBstock.at(-1), 0)
        .toLocaleString()}
    </div>
  );
};

export default FooterWBStocks;
