import styles from './style.module.css';

const HeaderDailyEbitdaWOAds = () => {
  return (
    <div className={styles.cell}>
      <abbr
        title={
          'EBITDA единицы товара * на количество выкупов - (расходы на РК * 100/120)'
        }
      >
        EBITDA/День без РК
      </abbr>
    </div>
  );
};

export default HeaderDailyEbitdaWOAds;
