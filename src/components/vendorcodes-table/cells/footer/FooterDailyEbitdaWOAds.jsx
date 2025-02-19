import styles from './style.module.css';

const FooterDailyEbitdaWOAds = ({ data }) => {
  return (
    <div className={styles.cell}>
      {data.reduce((n, { debWOAdsSum }) => n + debWOAdsSum, 0).toLocaleString()}{' '}
      ₽
    </div>
  );
};

export default FooterDailyEbitdaWOAds;
