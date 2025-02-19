import styles from './style.module.css';

const HeaderTurnover = () => {
  return (
    <div className={styles.cell}>
      <abbr
        title={
          'Остатки на складе WB, деленные на среднее количество заказов за последние 7 дней.'
        }
      >
        Оборачиваемость WB
      </abbr>
    </div>
  );
};

export default HeaderTurnover;
