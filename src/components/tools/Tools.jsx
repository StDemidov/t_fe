import { NavLink } from 'react-router-dom';

import styles from './style.module.css';

const Tools = () => {
  return (
    <section>
      <h2 className={styles.blockName}>Настройки</h2>
      <hr className={styles.line} />
      <div className={styles.tasksBox}>
        {/* <NavLink to="abc_page" className={styles.link}>
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <p className={styles.cardTitle}>ABC-критерии</p>
              <p className={styles.cardPara}>
                Установка критериев по-умолчанию для различных категорий товаров
              </p>
            </div>
          </div>
        </NavLink> */}

        <NavLink to="ebitda_settings" className={styles.link}>
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <p className={styles.cardTitle}>Настройки EBITDA</p>
              <p className={styles.cardPara}>
                Настройки параметров, используемых в расчетах EBITDA
              </p>
            </div>
          </div>
        </NavLink>
        <NavLink to="tags_setup" className={styles.link}>
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <p className={styles.cardTitle}>Работа с Тегами</p>
              <p className={styles.cardPara}>
                Массовое добавление тегов, удаление
              </p>
            </div>
          </div>
        </NavLink>
        <NavLink to="upload_photo" className={styles.link}>
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <p className={styles.cardTitle}>Загрузка фото в карточки</p>
              <p className={styles.cardPara}>
                Массовое добавление фото для заданных артикулов на заданную
                позицию.
              </p>
            </div>
          </div>
        </NavLink>
      </div>
      <h2 className={styles.blockName}>Управление ценами</h2>
      <hr className={styles.line} />
      <div className={styles.tasksBox}>
        {/* <NavLink to="tasks_b_28" className={styles.link}>
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
        </NavLink> */}

        <NavLink to="tasks_drain" className={styles.link}>
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <p className={styles.cardTitle}>Ликвидация товара</p>
              <p className={styles.cardPara}>
                Задачи на ликвидацию товара с корректировкой цены с целью
                избавления от остатков к заданной дате
              </p>
            </div>
          </div>
        </NavLink>

        <NavLink to="tasks_hold_stocks" className={styles.link}>
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <p className={styles.cardTitle}>Удержание остатков</p>
              <p className={styles.cardPara}>
                Задачи на удержание остатков с увеличением цены с целью
                сохранения остатков к заданной дате
              </p>
            </div>
          </div>
        </NavLink>
      </div>
      <h2 className={styles.blockName}>Реклама</h2>
      <hr className={styles.line} />
      <div className={styles.tasksBox}>
        <NavLink to="auto_campaigns" className={styles.link}>
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <p className={styles.cardTitle}>Автоматические кампании</p>
              <p className={styles.cardPara}>
                Просмотр списка автоматических кампаний, заведение новых
                кампаний на автоматическом контроле и перевод в аукцион
              </p>
            </div>
          </div>
        </NavLink>
        <NavLink to="auction_campaigns" className={styles.link}>
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <p className={styles.cardTitle}>Аукцион</p>
              <p className={styles.cardPara}>
                Просмотр списка кампаний типа Аукцион и управление
              </p>
            </div>
          </div>
        </NavLink>
      </div>
    </section>
  );
};

export default Tools;
