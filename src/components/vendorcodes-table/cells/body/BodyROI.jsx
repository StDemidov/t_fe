import styles from './style.module.css';

const BodyROI = ({ vc }) => {
  return (
    <div className={`${styles.cell} ${styles.cellCPS}`}>
      <div>
        <span>{Math.round(vc.roi)} %</span>
      </div>
    </div>
  );
};

export default BodyROI;
