import styles from './PromoTable.module.css';

/** Значение с двумя знаками и знаком %; прочерк, если значения нет. */
const withPercent = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  return Number.isFinite(num) ? `${num.toFixed(2)} %` : '—';
};

/**
 * Ячейка колонки «Метрики кластеров»: три строки с метриками кластеров
 * (CTR, CR клик-корзина, CR показ-корзина). Сетка 2×3: подписи в одной
 * колонке, плашки строго друг под другом в другой.
 *
 * @param {object} props
 * @param {object} props.item — рекламная кампания
 */
const ClusterMetricsCell = ({ item }) => (
  <div className={styles.clusterCell}>
    <span className={styles.thresholdLabel}>CTR:</span>
    <span className={styles.infoBadge}>
      {withPercent(item.clustersCtrTotal)}
    </span>
    <span className={styles.thresholdLabel}>СR (клик-корз.):</span>
    <span className={styles.infoBadge}>
      {withPercent(item.clustersClickToCartTotal)}
    </span>
    <span className={styles.thresholdLabel}>СR (показ-корз.):</span>
    <span className={styles.infoBadge}>
      {withPercent(item.clustersViewToCartTotal)}
    </span>
  </div>
);

export default ClusterMetricsCell;
