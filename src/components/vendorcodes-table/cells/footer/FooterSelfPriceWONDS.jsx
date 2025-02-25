import styles from './style.module.css';

const FooterSelfPriceWONDS = ({ selfPriceWONDS }) => {
  return (
    <div className={styles.cell}>
      {selfPriceWONDS ? selfPriceWONDS.toLocaleString() : 0} ₽
    </div>
  );
};

export default FooterSelfPriceWONDS;
