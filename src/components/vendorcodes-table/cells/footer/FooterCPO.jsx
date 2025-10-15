import { MdCurrencyRuble } from 'react-icons/md';
import styles from './style.module.css';

const FooterCPO = ({ avgCostPerOrder }) => {
  return (
    <div className={styles.cell}>
      <div>{avgCostPerOrder ? avgCostPerOrder.toLocaleString() : 0}</div>
      <MdCurrencyRuble className={styles.ruble} />
    </div>
  );
};

export default FooterCPO;
