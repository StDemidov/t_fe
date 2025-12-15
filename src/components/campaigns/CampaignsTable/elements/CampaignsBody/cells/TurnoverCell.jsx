import TurnoverTags from './elements/TurnoverTags';
import styles from './style.module.css';

const TurnoverCell = ({
  lowerTurnoverThreshold,
  turnoverDays,
  turnoverByBarcodes,
  cellStyle,
}) => {
  return (
    <div className={`${cellStyle} ${styles.turnoverCell}`}>
      <TurnoverTags
        lowerTurnoverThreshold={lowerTurnoverThreshold}
        turnoverDays={turnoverDays}
        turnoverByBarcodes={turnoverByBarcodes}
      />
    </div>
  );
};

export default TurnoverCell;
