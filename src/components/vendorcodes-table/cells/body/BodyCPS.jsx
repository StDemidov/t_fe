import styles from './style.module.css';
import { MdCurrencyRuble } from 'react-icons/md';

const BodyCPS = ({ vc }) => {
  return (
    <div className={`${styles.cell} ${styles.cellCPS}`}>
      <div>
        <span>{Math.round(vc.cps)}</span>
        <MdCurrencyRuble className={styles.ruble} />
      </div>
    </div>
  );
};

export default BodyCPS;
