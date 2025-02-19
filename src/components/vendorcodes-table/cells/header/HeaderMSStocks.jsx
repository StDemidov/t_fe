import styles from './style.module.css';

const HeaderMSStocks = () => {
  return (
    <div className={`${styles.cell} ${styles.cellMSStock}`}>
      <abbr
        title={
          'Количество товара на Моем Складе на момент 4 утра текущего дня.'
        }
      >
        Остаток МС
      </abbr>
    </div>
  );
};

export default HeaderMSStocks;
