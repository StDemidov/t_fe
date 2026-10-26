import { FaUser, FaWarehouse } from 'react-icons/fa6';
import { RxLapTimer } from 'react-icons/rx';

import { getStatusMeta, PAUSE_ICON_STATUSES } from './statuses';
import styles from './PromoTable.module.css';

/**
 * Ячейка колонки «Статус»: плашка с коротким названием статуса,
 * цвет — по смыслу статуса (см. statuses.js), полное описание — в title.
 *
 * Для статусов паузы (11 / 211 / -11 / -211) слева внутри плашки
 * рисуется иконка причины: isPausedByUser → человек, isPausedByTurnover →
 * склад, isPausedByTime → таймер. Если истинно несколько флагов,
 * берётся приоритетная (user > turnover > time).
 *
 * @param {object} props
 * @param {object} props.item — рекламная кампания
 */
const StatusCell = ({ item }) => {
  const code = Number(item.status);
  const meta = getStatusMeta(code);

  let PauseIcon = null;
  if (PAUSE_ICON_STATUSES.includes(code)) {
    if (item.isPausedByUser) PauseIcon = FaUser;
    else if (item.isPausedByTurnover) PauseIcon = FaWarehouse;
    else if (item.isPausedByTime) PauseIcon = RxLapTimer;
  }

  const toneClass = {
    neutral: styles.statusToneNeutral,
    wait: styles.statusToneWait,
    success: styles.statusToneSuccess,
    attention: styles.statusToneAttention,
    error: styles.statusToneError,
  }[meta.tone];

  return (
    <span className={`${styles.statusBadge} ${toneClass}`} title={meta.title}>
      {PauseIcon ? (
        <span className={styles.statusIcon}>
          <PauseIcon />
        </span>
      ) : null}
      {meta.label}
    </span>
  );
};

export default StatusCell;
