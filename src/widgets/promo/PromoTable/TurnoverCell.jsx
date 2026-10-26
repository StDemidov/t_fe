import styles from './PromoTable.module.css';

/**
 * Ячейка колонки «Оборачиваемость»: плашка с типом оборачиваемости
 * (по артикулу — сиреневая, по размерам — голубая), а под ней —
 * порог и количество дней.
 *
 * @param {object} props
 * @param {object} props.item — рекламная кампания
 */
const TurnoverCell = ({ item }) => (
  <div className={styles.turnoverCell}>
    <span
      className={`${styles.infoBadge} ${item.turnoverByBarcodes ? styles.turnoverBySizes : styles.turnoverBySku}`}
    >
      {item.turnoverByBarcodes ? 'По размерам' : 'По артикулу'}
    </span>
    <span className={styles.turnoverText}>
      Порог: {item.lowerTurnoverThreshold ?? '—'}
    </span>
    <span className={styles.turnoverText}>
      Кол-во дней: {item.turnoverDays ?? '—'}
    </span>
  </div>
);

export default TurnoverCell;
