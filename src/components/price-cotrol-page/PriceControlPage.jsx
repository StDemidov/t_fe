import { NavLink } from 'react-router-dom';
import styles from './style.module.css';

const PriceControlPage = () => {
  return (
    <section>
      <h1>Контроль цен</h1>
      <div className={styles.description}>Описание</div>
      <div className={styles.tasksBox}>
        <NavLink to="tasks_b_28" className={styles.link}>
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <p className={styles.cardTitle}>Контроль цен до 28 дня</p>
              <p className={styles.cardPara}>
                Задачи на регулировку цен в зависимости от рассчитываемой
                АВС-категории до 28 дня жизни товара
              </p>
            </div>
          </div>
        </NavLink>

        <NavLink to="tasks_a_28" className={styles.link}>
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <p className={styles.cardTitle}>Контроль цен после 28 дня</p>
              <p className={styles.cardPara}>
                Задачи на регулировку цен в зависимости от рассчитываемой
                АВС-категории после 28 дня жизни товара
              </p>
            </div>
          </div>
        </NavLink>

        <NavLink to="tasks_a_28" className={styles.link}>
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <p className={styles.cardTitle}>Ликвидация товара</p>
              <p className={styles.cardPara}>
                Задачи на ликвидацию товара с ежедневным изменением цены с целью
                избавления от остатков к заданной дате
              </p>
            </div>
          </div>
        </NavLink>
      </div>
    </section>
  );
};

export default PriceControlPage;
