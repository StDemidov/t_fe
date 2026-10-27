import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { IoMdRefreshCircle } from 'react-icons/io';

import { selectUser } from '../../redux/slices/authSlice';
import {
  fetchCategories,
  getDefaultStartDate,
  getDefaultEndDate,
} from '../../entities/categories';
import { DateRangePicker, SortSelect } from '../../shared/ui';
import { CategoriesTable } from '../../widgets/categories-table';
import {
  CATEGORY_COLUMNS,
  lastDaily,
} from '../../widgets/categories-table/columns';

import '../../app/styles/global.css';
import styles from './CategoriesPage.module.css';

const SORTABLE_CATEGORY_COLUMNS = CATEGORY_COLUMNS.filter(
  (column) => column.id !== 'stocksLast'
);

const getCategorySortValue = (item, field) => {
  if (field === 'category') return String(item.category || '').toLocaleLowerCase('ru');
  if (field === 'skusCount') return Number(item.skus_count) || 0;
  if (field === 'orders') {
    return Number(item.ordersTotalSum) ||
      (Number(item.ordersFbwSum) || 0) + (Number(item.ordersFbsSum) || 0);
  }
  if (field === 'sales') {
    return (Number(item.salesFbwSum) || 0) + (Number(item.salesFbsSum) || 0);
  }
  if (field === 'stocks') {
    return lastDaily(item.stocksFbw) + lastDaily(item.stocksFbs);
  }
  if (field === 'ebitdaDay') {
    return (
      (Number(item.totalEbitdaBySkusFbwSum) || 0) +
      (Number(item.totalEbitdaBySkusFbsSum) || 0)
    );
  }
  if (field === 'ebitdaNoAds') return Number(item.totalEbitdaTotalWithoutAdsSum) || 0;
  if (field === 'ads') return Number(item.adsCostsSum) || 0;
  if (field === 'cpoClean') return Number(item.cpoCleanAvg) || 0;
  if (field === 'cpsClean') return Number(item.cpsCleanAvg) || 0;
  if (field === 'cpoSpread') return Number(item.cpoRawAvg) || 0;
  if (field === 'cpsSpread') return Number(item.cpsRawAvg) || 0;
  if (field === 'ebitdaAvg') return Number(item.avgEbitdaOfSkuAvg) || 0;
  if (field === 'ebitdaByOrders') return Number(item.ebitdaByOrdersAvg) || 0;
  if (field === 'avgPrice') return Number(item.avgPriceAvg) || 0;
  if (field === 'avgBuyout') return Number(item.avgBuyoutPercentMedian) || 0;
  if (field === 'crClickToCart') {
    return (Number(item.clicksSum) || 0)
      ? ((Number(item.addingsToCartSum) || 0) / Number(item.clicksSum)) * 100
      : 0;
  }
  if (field === 'crCartToOrder') {
    return (Number(item.addingsToCartSum) || 0)
      ? ((Number(item.ordersTotalSum) || 0) / Number(item.addingsToCartSum)) * 100
      : 0;
  }
  if (field === 'crClickToOrder') {
    return (Number(item.clicksSum) || 0)
      ? ((Number(item.ordersTotalSum) || 0) / Number(item.clicksSum)) * 100
      : 0;
  }
  if (field === 'avgSelfprice') return Number(item.avgSkuSelfpriceWithoutNds) || 0;
  return Number(item[field]) || 0;
};

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
  const [sortValue, setSortValue] = useState('ebitdaDay:desc');

  const sortOptions = useMemo(
    () =>
      SORTABLE_CATEGORY_COLUMNS.flatMap((column) => [
        { value: `${column.id}:desc`, label: column.label },
        { value: `${column.id}:asc`, label: column.label },
      ]),
    []
  );

  const sortedItems = useMemo(() => {
    const [field, direction] = sortValue.split(':');
    return [...items].sort((left, right) => {
      const leftValue = getCategorySortValue(left, field);
      const rightValue = getCategorySortValue(right, field);
      const result =
        typeof leftValue === 'string' && typeof rightValue === 'string'
          ? leftValue.localeCompare(rightValue, 'ru')
          : leftValue - rightValue;
      return direction === 'asc' ? result : -result;
    });
  }, [items, sortValue]);

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
            <SortSelect
              options={sortOptions}
              value={sortValue}
              onChange={setSortValue}
              disabled={isLoading}
            />
          </>
        )}
      </div>

      <div className={styles.tableArea}>
        {isLoading ? (
          <div className={styles.skeleton} />
        ) : (
          <CategoriesTable items={sortedItems} resetTrigger={resetColumns} />
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
