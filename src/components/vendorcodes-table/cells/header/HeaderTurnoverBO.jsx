import styles from './style.module.css';

const HeaderTurnoverBO = () => {
  return (
    <div className={styles.cell}>
      <abbr
        title={
          'Остатки на складе WB, деленные на среднее количество заказов за последние 7 дней с учетом процента выкупа по артикулу.'
        }
      >
        Обор-ть WB (выкуп)
      </abbr>
    </div>
  );
};

export default HeaderTurnoverBO;
