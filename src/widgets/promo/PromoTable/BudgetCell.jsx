import styles from './PromoTable.module.css';

/** Число с разделителями тысяч; прочерк, если значения нет. */
const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  return Number.isFinite(num)
    ? new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(num)
    : String(value);
};

/**
 * Ячейка колонки «Бюджет»: крупное значение бюджета, ниже — сумма
 * пополнения и порог бюджета.
 *
 * @param {object} props
 * @param {object} props.item — рекламная кампания
 */
const BudgetCell = ({ item }) => (
  <div className={styles.budgetCell}>
    <span className={styles.budgetValue}>{formatNumber(item.budget)}</span>
    <span className={styles.budgetText}>
      Пополнять на: {formatNumber(item.replinishmentAmount)}
    </span>
    <span className={styles.budgetText}>
      Порог: {formatNumber(item.budgetFloor)}
    </span>
  </div>
);

export default BudgetCell;
