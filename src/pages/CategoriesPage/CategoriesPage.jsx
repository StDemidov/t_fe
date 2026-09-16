import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { IoMdRefreshCircle } from 'react-icons/io';

import { selectUser } from '../../redux/slices/authSlice';
import {
  fetchCategories,
  getDefaultStartDate,
  getDefaultEndDate,
} from '../../entities/categories';
import { DateRangePicker } from '../../shared/ui';
import { CategoriesTable } from '../../widgets/categories-table';

import '../../app/styles/global.css';
import styles from './CategoriesPage.module.css';

const CategoriesPage = () => {
  const currentUser = useSelector(selectUser);

  // По умолчанию — данные за 30 дней по вчерашний день включительно.
  const [dateRange, setDateRange] = useState(() => {
    const endDate = getDefaultEndDate();
    return { startDate: getDefaultStartDate(endDate), endDate };
  });
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Счётчик сброса порядка/видимости колонок таблицы.
  const [resetColumns, setResetColumns] = useState(0);

  // Запрос при открытии страницы и при смене диапазона дат.
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchCategories(dateRange)
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dateRange]);

  const hasAccess =
    currentUser?.permissions?.category_metrics === true ||
    currentUser?.permissions?.is_admin === true;

  if (!hasAccess) {
    return (
      <div className={`page ${styles.root}`}>
        <p className={styles.forbidden}>Для доступа не достаточно прав.</p>
      </div>
    );
  }

  return (
    <div className={`page ${styles.root}`}>
      <header className="pageHeader">
        <h1 className="pageTitle">Категории</h1>
      </header>

      <div className={styles.filtersRow}>
        {isLoading ? (
          <div className={styles.skeletonFilters}>
            <div className={`${styles.skeletonBlock} ${styles.skeletonBtn}`} />
            <div className={`${styles.skeletonBlock} ${styles.skeletonDate}`} />
          </div>
        ) : (
          <>
            <button
              type="button"
              className={styles.refreshColsBtn}
              title="Вернуть скрытые колонки и сбросить порядок"
              onClick={() => setResetColumns((n) => n + 1)}
            >
              <IoMdRefreshCircle />
            </button>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              minDate="2024-07-01"
              maxDate={getDefaultEndDate()}
            />
          </>
        )}
      </div>

      <div className={styles.tableArea}>
        {isLoading ? (
          <div className={styles.skeleton} />
        ) : (
          <CategoriesTable items={items} resetTrigger={resetColumns} />
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;