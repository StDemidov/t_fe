import styles from './style.module.css';

const BodyBuyout = ({ vc }) => {
  return (
    <div className={`${styles.cell} ${styles.cellBuyout}`}>{vc.buyoutP} %</div>
  );
};

export default BodyBuyout;
