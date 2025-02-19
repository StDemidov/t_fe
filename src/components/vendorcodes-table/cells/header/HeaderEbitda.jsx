import styles from './style.module.css';

const HeaderEbitda = () => {
  return (
    <div className={`${styles.cell} ${styles.cellEbitda}`}>
      <abbr
        title={
          'EBITDA единицы товара за вчерашний день. Зависит от цены после СПП (которая меняется) и от себестоимости.'
        }
      >
        EBITDA
      </abbr>
    </div>
  );
};

export default HeaderEbitda;
