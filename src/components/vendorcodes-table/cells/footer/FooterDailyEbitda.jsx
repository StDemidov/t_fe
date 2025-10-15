import { MdCurrencyRuble } from 'react-icons/md';
import styles from './style.module.css';

const FooterDailyEbitda = ({ data }) => {
  return (
    <div className={styles.cell}>
      <div>
        {data.reduce((n, { debSum }) => n + debSum, 0).toLocaleString()}
      </div>
      <MdCurrencyRuble className={styles.ruble} />
    </div>
  );
};

export default FooterDailyEbitda;
