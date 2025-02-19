import styles from './style.module.css';

const HeaderSales = () => {
  return (
    <div className={styles.cell}>
      <abbr
        title={
          'Количество выкупов на дату. Не связано по датам с заказами, т.к. в одну дату может быть выкуплен товар с разными датами Заказа. Голубые столбики - не точные продажи, полученные НЕ из отчета по реализации. Фиолетовые - продажи полученные из отчета по реализации.'
        }
      >
        Выкупы
      </abbr>
    </div>
  );
};

export default HeaderSales;
