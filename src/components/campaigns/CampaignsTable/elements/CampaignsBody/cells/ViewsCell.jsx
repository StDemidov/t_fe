import BarplotSmall from './elements/BarPlotSmall';
import styles from './style.module.css';

const ViewsCell = ({ views, dates, cellStyle, ended }) => {
  return (
    <div className={`${cellStyle} ${styles.viewsCell}`}>
      <BarplotSmall data={views} dates={dates} ended={ended} />
    </div>
  );
};

export default ViewsCell;
