import BarplotSmall from './elements/BarPlotSmall';
import styles from './style.module.css';

const ViewsCell = ({ views, dates, cellStyle }) => {
  return (
    <div className={`${cellStyle} ${styles.viewsCell}`}>
      <BarplotSmall data={views} dates={dates} />
    </div>
  );
};

export default ViewsCell;
