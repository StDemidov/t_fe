import styles from './style.module.css';

const HeaderSelfPriceWONDS = () => {
  return (
    <div className={styles.cell}>
      <abbr
        title={
          'Себестоимость товара - услуги без НДС + ткань без НДС + косты. Данные тянутся из таблицы СЕБЕСТОИМОСТЬ.'
        }
      >
        Себестоимость без НДС
      </abbr>
    </div>
  );
};

export default HeaderSelfPriceWONDS;
