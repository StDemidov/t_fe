import { MdCurrencyRuble } from 'react-icons/md';
import styles from './style.module.css';

const TotalSpendCell = ({ totalSpend, cellStyle, ended }) => {
  return (
    <div
      className={`${cellStyle} ${styles.totalSpendCell} ${
        totalSpend == 0 ? styles.zeroStat : ''
      }`}
      style={ended ? { color: 'gray' } : {}}
    >
      <div>{totalSpend.toLocaleString()}</div>
      <MdCurrencyRuble className={styles.ruble} />
    </div>
  );
};

export default TotalSpendCell;
