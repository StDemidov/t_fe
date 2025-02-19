import styles from './style.module.css';

const FooterSales = ({ data }) => {
  return (
    <div className={styles.cell}>
      {data.reduce((n, { salesSum }) => n + salesSum, 0).toLocaleString()}
    </div>
  );
};

export default FooterSales;
