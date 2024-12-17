import { useNavigate } from 'react-router-dom';
import { PiEmptyDuotone } from 'react-icons/pi';
import getMondayFromWeekNum from '../../utils/getDateByWeekNum';
import styles from './style.module.css';
import { useSelector } from 'react-redux';
import { selectCategoryNameFilter } from '../../redux/slices/filterSlice';

const CategoryTable = ({ categories }) => {
  const navigation = useNavigate();
  const categoryNameFilter = useSelector(selectCategoryNameFilter);
  function getDateWeek() {
    const currentDate = new Date();
    const januaryFirst = new Date(currentDate.getFullYear(), 0, 1);
    const daysToNextMonday =
      januaryFirst.getDay() === 1 ? 0 : (7 - januaryFirst.getDay()) % 7;
    const nextMonday = new Date(
      currentDate.getFullYear(),
      0,
      januaryFirst.getDate() + daysToNextMonday
    );
    return currentDate < nextMonday
      ? 52
      : currentDate > nextMonday
      ? Math.ceil((currentDate - nextMonday) / (24 * 3600 * 1000) / 7)
      : 1;
  }

  const getCurrentWeekKoefs = (category) => {
    const curr_num_week = getDateWeek();
    const s_koefs_array = category.seasonal_koefs.split(',');
    const current_s_koef = s_koefs_array[curr_num_week - 1];
    const p_koefs_array = category.avg_price_koefs.split(',');
    const current_p_koef = p_koefs_array[curr_num_week - 1];
    return { s_k: Number(current_s_koef), p_k: Number(current_p_koef) };
  };

  const handleClickOnRow = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    navigation(`/categories/${id}`);
  };

  const highlightMatch = (text, filter) => {
    if (filter.length === 0) return text;
    const regex = new RegExp(`(${filter})`, 'gi');
    return text.split(regex).map((substring, i) => {
      if (substring.toLowerCase() === filter.toLowerCase()) {
        return (
          <span key={i} className={styles.highlight}>
            {substring}
          </span>
        );
      }
      return substring;
    });
  };

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.tableHeader}`}>
          <div className={`${styles.cell} ${styles.category}`}>Категория</div>
          <div className={`${styles.cell} ${styles.sKoef}`}>
            Коэффициент сезонности
          </div>
          <div className={styles.cell}>Коэффициент цены</div>
          <div className={styles.cell}>Дата старта продаж 1</div>
          <div className={styles.cell}>Дата конца продаж 1</div>
          <div className={styles.cell}>Дата старта продаж 2</div>
          <div className={styles.cell}>Дата конца продаж 2</div>
        </div>
        {categories.map((category) => {
          const { s_k, p_k } = getCurrentWeekKoefs(category);
          return (
            <div
              className={`${styles.row} ${styles.rowHover}`}
              data-value={category.id}
              onClick={handleClickOnRow}
              key={category.id}
            >
              <div className={`${styles.cell} ${styles.category}`}>
                {highlightMatch(category.name, categoryNameFilter)}
              </div>
              <div className={`${styles.cell} ${styles.sKoef}`}>
                <div
                  className={`${styles.koef} ${s_k >= 1 ? '' : styles.koefBad}`}
                >
                  {s_k}
                </div>
              </div>
              <div className={styles.cell}>
                <div
                  className={`${styles.koef} ${p_k >= 1 ? '' : styles.koefBad}`}
                >
                  {p_k}
                </div>
              </div>
              <div className={styles.cell}>
                {getMondayFromWeekNum(category.enter_date_1)}
              </div>
              <div className={styles.cell}>
                {getMondayFromWeekNum(category.exit_date_1)}
              </div>
              <div className={styles.cell}>
                {category.enter_date_2 ? (
                  getMondayFromWeekNum(category.enter_date_2)
                ) : (
                  <PiEmptyDuotone color="red" />
                )}
              </div>
              <div className={styles.cell}>
                {category.exit_date_2 ? (
                  getMondayFromWeekNum(category.exit_date_2)
                ) : (
                  <PiEmptyDuotone color="red" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTable;
