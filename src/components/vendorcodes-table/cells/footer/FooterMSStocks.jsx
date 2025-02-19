import styles from './style.module.css';

const FooterMSStocks = ({ data }) => {
  return (
    <div className={`${styles.cell} ${styles.cellMSStock}`}>
      {data.reduce((n, { msTotal }) => n + msTotal, 0).toLocaleString()}
    </div>
  );
};

export default FooterMSStocks;
