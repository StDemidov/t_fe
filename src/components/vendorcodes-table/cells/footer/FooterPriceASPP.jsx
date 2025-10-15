import { MdCurrencyRuble } from 'react-icons/md';
import styles from './style.module.css';

const FooterPriceASPP = ({ avg_price_ssp }) => {
  return (
    <div className={`${styles.cell} ${styles.cellSPP}`}>
      <div>{avg_price_ssp ? avg_price_ssp.toLocaleString() : 0}</div>
      <MdCurrencyRuble className={styles.ruble} />
    </div>
  );
};

export default FooterPriceASPP;
