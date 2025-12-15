import BarplotSmall from './elements/BarPlotSmall';
import styles from './style.module.css';

const SpendCell = ({ spend, dates, cellStyle }) => {
  return (
    <div className={`${cellStyle} ${styles.spendCell}`}>
      <BarplotSmall data={spend} dates={dates} />
    </div>
  );
};

export default SpendCell;
