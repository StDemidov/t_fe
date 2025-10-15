import styles from './style.module.css';

const BodyTurnover = ({ vc }) => {
  return (
    <div className={`${styles.cell} ${styles.turnoverCell}`}>
      <div className={styles.turnoverRow}>
        <div className={styles.turnoverLabel}>Заказы</div>
        <span>{vc.turnoverWB}</span>
      </div>
      <div className={styles.turnoverRow}>
        <div className={styles.turnoverLabel}>Выкупы</div>
        <span>{vc.turnoverWBBuyout}</span>
      </div>
    </div>
  );
};

export default BodyTurnover;
