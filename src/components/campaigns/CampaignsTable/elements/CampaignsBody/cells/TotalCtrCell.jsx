import styles from './style.module.css';

const TotalCtrCell = ({ totalCtr, cellStyle }) => {
  return (
    <div
      className={`${cellStyle} ${styles.totalCtrCell} ${
        totalCtr == 0 ? styles.zeroStat : ''
      }`}
    >
      {(totalCtr * 100).toFixed(2)} %
    </div>
  );
};

export default TotalCtrCell;
