import styles from './PromoTable.module.css';

/** Число с разделителями тысяч; прочерк, если значения нет. */
const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  return Number.isFinite(num)
    ? new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(num)
    : String(value);
};

/** CTR-порог в процентах: ctrBench задан долей (0.055 → 5.5 %). */
const formatCtr = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return `${formatNumber(Math.round(num * 100 * 100) / 100)} %`;
};

/**
 * Ячейка колонки «Пороги»: две строки — «Показы» с плашкой порога
 * показов (viewsBench) и «CTR» с плашкой порога CTR (ctrBench, в %).
 * Сетка 2×2: подписи в одной колонке, плашки строго друг под другом.
 *
 * @param {object} props
 * @param {object} props.item — рекламная кампания
 */
const ThresholdsCell = ({ item }) => (
  <div className={styles.thresholdsCell}>
    <span className={styles.thresholdLabel}>Показы:</span>
    <span className={styles.infoBadge}>{formatNumber(item.viewsBench)}</span>
    <span className={styles.thresholdLabel}>CTR:</span>
    <span className={styles.infoBadge}>{formatCtr(item.ctrBench)}</span>
  </div>
);

export default ThresholdsCell;
