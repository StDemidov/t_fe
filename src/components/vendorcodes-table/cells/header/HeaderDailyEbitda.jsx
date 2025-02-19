import styles from './style.module.css';

const HeaderDailyEbitda = () => {
  return (
    <div className={styles.cell}>
      <abbr title={'EBITDA единицы товара * на количество выкупов.'}>
        EBITDA/День
      </abbr>
    </div>
  );
};

export default HeaderDailyEbitda;
