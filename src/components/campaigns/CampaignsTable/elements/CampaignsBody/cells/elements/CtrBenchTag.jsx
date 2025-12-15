import styles from './style.module.css';

const CtrBenchTag = ({ ctrBench }) => {
  return (
    <div className={styles.ctrBenchTag}>{(ctrBench * 100).toFixed(1)} %</div>
  );
};

export default CtrBenchTag;
