import BarplotSmall from './elements/BarPlotSmall';
import styles from './style.module.css';

const SpendCell = ({ spend, dates, cellStyle, ended }) => {
  return (
    <div className={`${cellStyle} ${styles.spendCell}`}>
      <BarplotSmall data={spend} dates={dates} ended={ended} />
    </div>
  );
};

export default SpendCell;
