import styles from './style.module.css';

const HeaderSelfPrice = () => {
  return (
    <div className={`${styles.cell} ${styles.cellSelfPrice}`}>
      <abbr
        title={
          'Себестоимость товара - услуги без НДС + ткань с НДС + косты. Данные тянутся из таблицы СЕБЕСТОИМОСТЬ.'
        }
      >
        Себестоимость
      </abbr>
    </div>
  );
};

export default HeaderSelfPrice;
