import { TbCircleLetterAFilled, TbCircleLetterBFilled } from 'react-icons/tb';

import styles from './style.module.css';

const TurnoverTags = ({
  lowerTurnoverThreshold,
  turnoverDays,
  turnoverByBarcodes,
}) => {
  return (
    <div className={styles.turnoverBox}>
      {lowerTurnoverThreshold === -1 ? (
        <div
          className={`${styles.turnoverThresholdTag} ${styles.turnoverThresholdTagDisabled}`}
        >
          Нет порога
        </div>
      ) : (
        <>
          <div className={styles.turnoverThresholdTag}>
            Порог: {lowerTurnoverThreshold}
          </div>
          <div className={styles.turnoverDays}>{turnoverDays}</div>
          <div className={styles.byBarcodeTag}>
            {turnoverByBarcodes ? (
              <TbCircleLetterBFilled />
            ) : (
              <TbCircleLetterAFilled />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TurnoverTags;
