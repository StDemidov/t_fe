import { MdCurrencyRuble } from 'react-icons/md';
import styles from './style.module.css';

const FooterEbitda = ({ avg_ebitda }) => {
  return (
    <div className={`${styles.cell} ${styles.cellEbitda}`}>
      <div>{avg_ebitda?.toLocaleString() ? avg_ebitda : 0}</div>
      <MdCurrencyRuble className={styles.ruble} />
    </div>
  );
};

export default FooterEbitda;
