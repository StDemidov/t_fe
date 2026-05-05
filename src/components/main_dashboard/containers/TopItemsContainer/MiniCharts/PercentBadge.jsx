import styles from './PercentBadge.module.css';

/**
 * Универсальная плашка с процентом.
 * value — число (0.005 → передаётся как 0.005, компонент умножает на 100)
 * alreadyPercent — если true, значение уже в процентах (не умножаем)
 * decimals — кол-во знаков после запятой
 */
const PercentBadge = ({ value, alreadyPercent = false, decimals = 1 }) => {
  const pct = alreadyPercent ? value : value * 100;
  const positive = pct >= 0;

  return (
    <span className={`${styles.badge} ${positive ? styles.pos : styles.neg}`}>
      {pct.toFixed(decimals)}%
    </span>
  );
};

export default PercentBadge;
