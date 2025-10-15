import { MdCurrencyRuble } from 'react-icons/md';
import styles from './style.module.css';

const FooterPriceBSPP = ({ avg_price_b_spp, fullAvgPrice }) => {
  return (
    <div className={styles.cell}>
      <span>{avg_price_b_spp ? avg_price_b_spp.toLocaleString() : 0}</span>
      <MdCurrencyRuble className={styles.ruble} />
      <div className={styles.avgPriceFooter}>
        <span>
          {fullAvgPrice
            ? `cpеднее ${fullAvgPrice.toLocaleString()}`
            : 'cpеднее 0'}
        </span>
        <MdCurrencyRuble className={styles.ruble} />
      </div>
    </div>
  );
};

export default FooterPriceBSPP;
