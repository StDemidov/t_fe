import { MdCurrencyRuble } from 'react-icons/md';
import styles from './style.module.css';

const FooterADSCosts = ({ data }) => {
  return (
    <div className={styles.cell}>
      <div>
        {data
          .reduce((n, { adsCostsSum }) => n + adsCostsSum, 0)
          .toLocaleString()}
      </div>
      <MdCurrencyRuble className={styles.ruble} />
    </div>
  );
};

export default FooterADSCosts;
