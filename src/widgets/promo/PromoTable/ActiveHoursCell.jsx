import styles from './PromoTable.module.css';

/**
 * Ячейка колонки «Время активности»: зелёная плашка «Круглосуточно»,
 * если у кампании нет ограничения (hasActiveHours == false), иначе —
 * оранжевая плашка с диапазоном часов {startHour}:00 – {pauseHour}:00.
 *
 * @param {object} props
 * @param {object} props.item — рекламная кампания
 */
const ActiveHoursCell = ({ item }) => {
  const limited = Boolean(item.hasActiveHours);
  const label = limited
    ? `${item.startHour}:00 - ${item.pauseHour}:00`
    : 'Круглосуточно';
  return (
    <span
      className={`${styles.infoBadge} ${limited ? styles.activeHoursLimited : styles.activeHoursAlways}`}
    >
      {label}
    </span>
  );
};

export default ActiveHoursCell;
