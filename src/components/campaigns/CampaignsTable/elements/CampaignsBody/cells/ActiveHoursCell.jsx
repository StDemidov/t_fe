import TimeTag from './elements/TimeTag';
import styles from './style.module.css';

const ActiveHoursCell = ({
  hasActiveHours,
  startHour,
  pauseHour,
  cellStyle,
}) => {
  return (
    <div className={`${cellStyle} ${styles.activeHoursCell}`}>
      <TimeTag
        hasActiveHours={hasActiveHours}
        startHour={startHour}
        pauseHour={pauseHour}
      />
    </div>
  );
};

export default ActiveHoursCell;
