import styles from './style.module.css';

const TimeTag = ({ hasActiveHours, startHour, pauseHour }) => {
  return (
    <>
      {' '}
      {hasActiveHours ? (
        <div
          className={styles.timeTag}
        >{`${startHour}:00 - ${pauseHour}:00`}</div>
      ) : (
        <div className={styles.timeTag}>Круглосуточно</div>
      )}
    </>
  );
};

export default TimeTag;
