import { MdCurrencyRuble } from 'react-icons/md';
import styles from './style.module.css';

const FooterDailyEbitdaWOAds = ({ data }) => {
  return (
    <div className={styles.cell}>
      <div>
        {data
          .reduce((n, { debWOAdsSum }) => n + debWOAdsSum, 0)
          .toLocaleString()}
      </div>
      <MdCurrencyRuble className={styles.ruble} />
    </div>
  );
};

export default FooterDailyEbitdaWOAds;
