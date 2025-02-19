import styles from './style.module.css';

const FooterPriceASPP = ({ avg_price_ssp }) => {
  return (
    <div className={`${styles.cell} ${styles.cellSPP}`}>
      {avg_price_ssp ? avg_price_ssp.toLocaleString() : 0} ₽
    </div>
  );
};

export default FooterPriceASPP;
