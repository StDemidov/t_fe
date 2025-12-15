import CtrBenchTag from './elements/CtrBenchTag';
import styles from './style.module.css';

const CtrBenchCell = ({ ctrBench, cellStyle }) => {
  return (
    <div className={`${cellStyle} ${styles.ctrBenchCell}`}>
      <CtrBenchTag ctrBench={ctrBench} />
    </div>
  );
};

export default CtrBenchCell;
