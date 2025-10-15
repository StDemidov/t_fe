import { MdCurrencyRuble } from 'react-icons/md';
import styles from './style.module.css';

const FooterSelfPrice = ({ avg_self_price }) => {
  return (
    <div className={`${styles.cell} ${styles.cellSelfPrice}`}>
      <div>{avg_self_price ? avg_self_price.toLocaleString() : 0}</div>
      <MdCurrencyRuble className={styles.ruble} />
    </div>
  );
};

export default FooterSelfPrice;
