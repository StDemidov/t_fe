import styles from './PromoTable.module.css';

/** Процент с двумя знаками; прочерк, если значения нет. */
const pct = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  return Number.isFinite(num) ? (num * 100).toFixed(2) : '—';
};

/**
 * Ячейка колонки «Фиксация»: зелёная плашка «Зафиксирована» или
 * жёлтая «Не зафиксирована» — по флагу isFixed. У единой кампании
 * под плашкой дополнительно CTR и CR (корз.) фиксации.
 *
 * @param {object} props
 * @param {object} props.item — рекламная кампания
 */
const FixationCell = ({ item }) => {
  const fixed = Boolean(item.isFixed);
  return (
    <div className={styles.fixationCell}>
      <span
        className={`${styles.infoBadge} ${fixed ? styles.fixationFixed : styles.fixationUnfixed}`}
      >
        {fixed ? 'Зафиксирована' : 'Не зафиксирована'}
      </span>
      {item.bidType === 'unified' ? (
        <>
          <span className={styles.fixationText}>CTR: {pct(item.fixedCtr)}</span>
          <span className={styles.fixationText}>
            CR (корз.): {pct(item.fixedAddToCart)}
          </span>
        </>
      ) : null}
    </div>
  );
};

export default FixationCell;
