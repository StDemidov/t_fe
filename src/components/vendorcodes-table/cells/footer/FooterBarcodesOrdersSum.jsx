import { MdCurrencyRuble } from 'react-icons/md';
import styles from './style.module.css';

const FooterBarcodesOrdersSum = ({ sumBarcodesOrders }) => {
  return (
    <div className={`${styles.cell} ${styles.cellEbitda}`}>
      <div>{sumBarcodesOrders?.toLocaleString()}</div>
    </div>
  );
};

export default FooterBarcodesOrdersSum;
