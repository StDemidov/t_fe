import styles from './style.module.css';
import { MdCurrencyRuble } from 'react-icons/md';

const BodyEbitda = ({ vc }) => {
  return (
    <div className={`${styles.cell} ${styles.cellEbitda}`}>
      <div>
        <span>{vc.ebitda}</span>
        <MdCurrencyRuble className={styles.ruble} />
      </div>
    </div>
  );
};

export default BodyEbitda;
