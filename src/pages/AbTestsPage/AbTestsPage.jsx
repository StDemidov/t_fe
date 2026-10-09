import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { animated, useSpring } from 'react-spring';

import '../../app/styles/global.css';
import {
  fetchAbTests,
  selectAbTestsItems,
  selectAbTestsIsLoading,
  selectAbTestsIsLoaded,
} from '../../entities/ab-tests';
import AbTestsToolbar from '../../widgets/ab-tests/AbTestsToolbar';
import AbTestsTable from '../../widgets/ab-tests/AbTestsTable';
import AbTestsPagination from '../../widgets/ab-tests/AbTestsPagination';
import {
  PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  paginateList,
  sortByDateDesc,
  SORT_RULES,
} from '../../widgets/ab-tests/lib/tableUtils';
import { AbTestCreateModal } from '../../shared/ui';
import styles from './AbTestsPage.module.css';

/** Разделы страницы. Первый — по умолчанию. */
const TABS = [
  { id: 'active', label: 'Активные' },
  { id: 'finished', label: 'Завершенные' },
  { id: 'pending', label: 'В обработке' },
];

const animStyles = {
  opacity: 1,
  from: { opacity: 0 },
};

const AbTestsPage = () => {
  const dispatch = useDispatch();
  // По умолчанию всегда открыт раздел «Активные».
  const [status, setStatus] = useState(TABS[0].id);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [search, setSearch] = useState('');
  // Коды выбранных статусов — применяется только в разделе «В обработке».
  const [statuses, setStatuses] = useState([]);
  const props = useSpring(animStyles);

  const items = useSelector(selectAbTestsItems(status));
  const isLoading = useSelector(selectAbTestsIsLoading(status));
  const isLoaded = useSelector(selectAbTestsIsLoaded(status));

  // Раздел догружаем только один раз: при первом открытии вкладки.
  // Возвраты по уже загруженным вкладкам идут по данным из стора.
  useEffect(() => {
    if (isLoaded) return;
    dispatch(fetchAbTests({ status }));
  }, [dispatch, status, isLoaded]);

  // Смена вкладки всегда возвращает на первую страницу.
  // Выбор статусов касается только «В обработке» — в других разделах сбрасываем.
  useEffect(() => {
    setCurrentPage(1);
    if (status !== 'pending') setStatuses([]);
  }, [status]);

  // Поиск по артикулу: совпадение по SKU или vendorCode, без учёта регистра.
  // Сортировка по свежести применяется уже к отфильтрованным тестам.
  const sortedItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const bySearch = query
      ? items.filter(
          (test) =>
            String(test.sku ?? '').toLowerCase().includes(query) ||
            String(test.vendorCode ?? '').toLowerCase().includes(query)
        )
      : items;
    const byStatus =
      statuses.length
        ? bySearch.filter((test) => statuses.includes(String(test.status)))
        : bySearch;
    const field = SORT_RULES[status];
    return field ? sortByDateDesc(byStatus, field) : byStatus;
  }, [items, search, statuses, status]);

  const { currentPageData, totalPages } = paginateList(
    sortedItems,
    currentPage,
    pageSize
  );

  const handleSearch = (query) => {
    setSearch(query);
    setCurrentPage(1);
  };

  const handleStatusFilter = (values) => {
    setStatuses(values);
    setCurrentPage(1);
  };

  // Тест создан — обновляем раздел «В обработке», даже если вкладка уже открыта.
  const handleTestCreated = () => {
    dispatch(fetchAbTests({ status: 'pending' }));
  };

  // Кнопка обновления: заново запрашиваем данные текущей вкладки.
  // Слайс на время запроса ставит isLoading — таблица показывает скелетон.
  const handleRefresh = () => {
    dispatch(fetchAbTests({ status }));
    setCurrentPage(1);
  };

  return (
    <animated.div style={props} className={`page ${styles.root}`}>
      <header className="pageHeader">
        <h1 className={`pageTitle ${styles.titleIndent}`}>A/B тесты</h1>
      </header>

      <div className={styles.tabs}>
        <div className={styles.tabsLeft}>
          {TABS.map((t) => (
            <button
              type="button"
              key={t.id}
              className={`${styles.tab} ${status === t.id ? styles.tabActive : ''}`}
              onClick={() => setStatus(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.createBtn}
          onClick={() => setCreateOpen(true)}
        >
          Создать тест
        </button>
      </div>

      <AbTestsToolbar
        onRefresh={handleRefresh}
        onSearch={handleSearch}
        showStatusFilter={status === 'pending'}
        statuses={statuses}
        onStatusFilter={handleStatusFilter}
      />

      <div className={styles.tableArea}>
        <AbTestsTable
          status={status}
          items={currentPageData}
          isLoading={isLoading}
        />
      </div>

      <AbTestsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={sortedItems.length}
        pageSize={pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      <AbTestCreateModal
        open={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onTestCreated={handleTestCreated}
      />
    </animated.div>
  );
};

export default AbTestsPage;