import styles from './style.module.css';

const TotalCtrCell = ({ totalCtr, cellStyle, ended }) => {
  return (
    <div
      className={`${cellStyle} ${styles.totalCtrCell} ${
        totalCtr == 0 ? styles.zeroStat : ''
      }`}
      style={ended ? { color: 'gray' } : {}}
    >
      {(totalCtr * 100).toFixed(2)} %
    </div>
  );
};

export default TotalCtrCell;
