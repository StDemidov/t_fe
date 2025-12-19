import BarplotSmall from './elements/BarPlotSmall';
import styles from './style.module.css';

const ClicksCell = ({ clicks, dates, cellStyle, ended }) => {
  return (
    <div className={`${cellStyle} ${styles.clicksCell}`}>
      <BarplotSmall data={clicks} dates={dates} ended={ended} />
    </div>
  );
};

export default ClicksCell;
