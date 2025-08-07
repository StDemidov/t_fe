import styles from './style.module.css';

const FooterPriceBSPP = ({ avg_price_b_spp, fullAvgPrice }) => {
  return (
    <div className={styles.cell}>
      <div className={styles.avgPriceFooterDiv}>
        <span>{avg_price_b_spp ? avg_price_b_spp.toLocaleString() : 0} ₽</span>
        <span className={styles.avgPriceFooter}>
          {fullAvgPrice
            ? `(cp: ${fullAvgPrice.toLocaleString()} ₽)`
            : '(cp: 0 ₽}'}
        </span>
      </div>
    </div>
  );
};

export default FooterPriceBSPP;
