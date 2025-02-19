import styles from './style.module.css';

const FooterBuyout = ({ avg_buyout }) => {
  return (
    <div className={`${styles.cell} ${styles.cellBuyout}`}>
      {avg_buyout ? avg_buyout : 0} %
    </div>
  );
};

export default FooterBuyout;
