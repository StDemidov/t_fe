import styles from './style.module.css';

const BodySelfPriceWONDS = ({ vc }) => {
  return <div className={styles.cell}>{vc.selfPriceWONds} ₽</div>;
};

export default BodySelfPriceWONDS;
