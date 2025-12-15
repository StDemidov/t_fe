import { MdCurrencyRuble } from 'react-icons/md';
import styles from './style.module.css';

const TotalSpendCell = ({ totalSpend, cellStyle }) => {
  return (
    <div
      className={`${cellStyle} ${styles.totalSpendCell} ${
        totalSpend == 0 ? styles.zeroStat : ''
      }`}
    >
      <div>{totalSpend.toLocaleString()}</div>
      <MdCurrencyRuble className={styles.ruble} />
    </div>
  );
};

export default TotalSpendCell;
