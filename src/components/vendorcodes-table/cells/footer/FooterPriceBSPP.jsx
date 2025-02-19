import styles from './style.module.css';

const FooterPriceBSPP = ({ avg_price_b_spp }) => {
  return (
    <div className={styles.cell}>
      {avg_price_b_spp ? avg_price_b_spp.toLocaleString() : 0} ₽
    </div>
  );
};

export default FooterPriceBSPP;
