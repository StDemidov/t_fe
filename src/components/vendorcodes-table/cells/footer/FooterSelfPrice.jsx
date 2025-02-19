import styles from './style.module.css';

const FooterSelfPrice = ({ avg_self_price }) => {
  return (
    <div className={`${styles.cell} ${styles.cellSelfPrice}`}>
      {avg_self_price ? avg_self_price.toLocaleString() : 0} ₽
    </div>
  );
};

export default FooterSelfPrice;
