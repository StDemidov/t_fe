import styles from './style.module.css';
import { MdCurrencyRuble } from 'react-icons/md';

const BodyBarcodesOrdersSum = ({ vc }) => {
  return (
    <div className={`${styles.cell} ${styles.cellEbitda}`}>
      <div>
        <span>{vc.barcodesOrdersSum}</span>
      </div>
    </div>
  );
};

export default BodyBarcodesOrdersSum;
