import BarplotSmall from './elements/BarplotSmall';
import styles from './style.module.css';

const ClicksCell = ({ clicks, dates, cellStyle }) => {
  return (
    <div className={`${cellStyle} ${styles.clicksCell}`}>
      <BarplotSmall data={clicks} dates={dates} />
    </div>
  );
};

export default ClicksCell;
