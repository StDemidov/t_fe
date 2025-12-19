import LineplotSmall from './elements/LineplotSmall';
import styles from './style.module.css';

const CtrCell = ({ ctr, dates, ctr14dTotal, cellStyle, ended }) => {
  return (
    <div className={`${cellStyle} ${styles.ctrCell}`}>
      <LineplotSmall
        data={ctr}
        dates={dates}
        total={ctr14dTotal}
        ended={ended}
      />
    </div>
  );
};

export default CtrCell;
