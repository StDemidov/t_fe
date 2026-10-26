import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { animated, useSpring } from 'react-spring';
import { FiRefreshCw } from 'react-icons/fi';
import { IoMdRefreshCircle } from 'react-icons/io';
import { MdFilterAltOff } from 'react-icons/md';
import { PiPause, PiPlay, PiSkipForward } from 'react-icons/pi';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { CiSettings } from 'react-icons/ci';
import { FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';

import '../../app/styles/global.css';
import { selectUser } from '../../redux/slices/authSlice';
import { setNotification } from '../../redux/slices/notificationSlice';
import {
  fetchPromo,
  promoAction,
  selectPromoItems,
  selectPromoIsLoading,
  selectPromoIsLoaded,
  selectPromoRange,
  getDefaultStartDate,
  getDefaultEndDate,
} from '../../entities/promo';
import {
  DateRangePicker,
  SearchFilter,
  DropdownFilter,
  SortSelect,
} from '../../shared/ui';
import PromoTable from '../../widgets/promo/PromoTable';
import PromoSettingsModal from '../../widgets/promo/PromoSettingsModal';
import PromoBulkSettingsModal from '../../widgets/promo/PromoBulkSettingsModal';
import {
  getStatusMeta,
  PAUSABLE_STATUSES,
  RESUMABLE_STATUSES,
  FINISHABLE_STATUSES,
} from '../../widgets/promo/PromoTable/statuses';
import styles from './PromoPage.module.css';

/** Конфигурация массовых/одиночных действий: ключ → тексты и гейт статусов. */
const ACTION_CONF = {
  pause: {
    statuses: PAUSABLE_STATUSES,
    confirmTitle: 'Поставить на паузу',
    confirmText: 'Поставить выбранные кампании на паузу?',
    rowVerb: 'Поставить на паузу',
    toastSingle: 'Кампания успешно поставлена на паузу',
    toastMany: 'Кампании успешно поставлены на паузу',
  },
  start: {
    statuses: RESUMABLE_STATUSES,
    confirmTitle: 'Запустить',
    confirmText: 'Запустить выбранные кампании?',
    rowVerb: 'Запустить',
    toastSingle: 'Кампания успешно запущена',
    toastMany: 'Кампании успешно запущены',
  },
  finish: {
    statuses: FINISHABLE_STATUSES,
    confirmTitle: 'Завершить',
    confirmText: 'Завершить выбранные кампании?',
    rowVerb: 'Завершить',
    toastSingle: 'Кампания успешно завершена',
    toastMany: 'Кампании успешно завершены',
  },
  delete: {
    statuses: null,
    confirmTitle: 'Удалить',
    confirmText: 'Удалить выбранные кампании? Действие необратимо.',
    rowVerb: 'Удалить',
    toastSingle: 'Кампания успешно удалена',
    toastMany: 'Кампании успешно удалены',
  },
};

/** Текст уведомления об успешном действии над одной или несколькими РК. */
const successToast = (kind, count) => {
  const conf = ACTION_CONF[kind];
  return count === 1 ? conf.toastSingle : conf.toastMany;
};

/** Типы кампаний для фильтра: bidType → название. */
const BID_TYPE_OPTIONS = [
  { value: 'manual', label: 'Ручная' },
  { value: 'unified', label: 'Единая' },
];

/** Время активности: hasActiveHours → значение фильтра. */
const ACTIVE_HOURS_OPTIONS = [
  { value: 'limited', label: 'С ограничением' },
  { value: 'unlimited', label: 'Без ограничений' },
];

/** Оборачиваемость: turnoverByBarcodes → значение фильтра. */
const TURNOVER_OPTIONS = [
  { value: 'bySizes', label: 'По размерам' },
  { value: 'bySku', label: 'По артикулу' },
];

/** Фиксация: isFixed → значение фильтра. */
const FIXATION_OPTIONS = [
  { value: 'fixed', label: 'Зафиксирована' },
  { value: 'unfixed', label: 'Не зафиксирована' },
];

const METRIC_SORT_OPTIONS = [
  ['spendSum', 'Траты'],
  ['viewsSum', 'Показы'],
  ['clicksSum', 'Клики'],
  ['addingsToCartSum', 'Добавления в корзину'],
  ['ctrTotal', 'CTR'],
  ['clickToCartTotal', 'CR клик-корзина'],
  ['viewToCartTotal', 'CR показ-корзина'],
];

const createSortOptions = (includeEndDate) => [
  ...METRIC_SORT_OPTIONS.flatMap(([value, label]) => [
    { value: `${value}:desc`, label },
    { value: `${value}:asc`, label },
  ]),
  { value: 'creationDatetime:desc', label: 'Дата старта: новые сначала' },
  { value: 'creationDatetime:asc', label: 'Дата старта: старые сначала' },
  ...(includeEndDate
    ? [
        { value: 'endDatetime:desc', label: 'Дата завершения: новые сначала' },
        { value: 'endDatetime:asc', label: 'Дата завершения: старые сначала' },
      ]
    : []),
];

/** Разделы страницы. Первый — по умолчанию. */
const TABS = [
  { id: 'active', label: 'Активные' },
  { id: 'finished', label: 'Завершенные' },
  { id: 'pending', label: 'В обработке' },
];

/** Набор колонок раздела «В обработке» (без метрик и графиков). */
const PENDING_COLUMN_IDS = [
  'article',
  'rkInfo',
  'status',
  'bids',
  'budget',
  'activeHours',
  'turnover',
  'thresholds',
  'actions',
];

/** Набор колонок раздела «Завершенные» (без «Бюджета»). */
const FINISHED_COLUMN_IDS = [
  'article',
  'rkInfo',
  'fixation',
  'status',
  'bids',
  'activeHours',
  'turnover',
  'thresholds',
  'clusterMetrics',
  'spend',
  'views',
  'clicks',
  'addingsToCart',
  'ctr',
  'clickToCart',
  'viewToCart',
  'actions',
];

const animStyles = {
  opacity: 1,
  from: { opacity: 0 },
};

/** Чисто числовой запрос = поиск по sku, буквенно-числовой = по артикулу. */
const isNumeric = (query) => /^\d+$/.test(query);

const matchesQuery = (item, query) => {
  if (!query) return true;
  if (isNumeric(query)) {
    return String(item.sku ?? '').includes(query);
  }
  const q = query.toLowerCase();
  return String(item.vendorcode ?? '')
    .toLowerCase()
    .includes(q);
};

/**
 * Страница «Реклама»: три раздела рекламных кампаний.
 *
 * «Активные» и «Завершенные» запрашиваются с диапазоном дат (календарь,
 * по умолчанию — 2 недели по сегодняшний день включительно) и показывают
 * таблицу с графиками метрик. «В обработке» — без дат, таблица пока
 * не реализована (заглушка).
 *
 * Поиск (по артикулу или SKU) и фильтры «Категория»/«Лекало» работают
 * на клиенте поверх загруженных данных — во всех трёх разделах.
 *
 * Имена модулей (promo) намеренно не содержат «ad» — иначе расширения
 * блокировщиков рекламы в браузере режут загрузку модулей (ERR_BLOCKED_BY_CLIENT).
 */
const PromoPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);
  // Массовые действия и создание РК — только админам и менеджерам кампаний.
  const canManage =
    currentUser?.permissions?.ad_camps_manage ||
    currentUser?.permissions?.is_admin;
  const [status, setStatus] = useState(TABS[0].id);
  // Счётчик сброса порядка/видимости колонок таблицы.
  const [resetColumns, setResetColumns] = useState(0);
  // Ключ перезапуска поисковой строки при сбросе фильтров.
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState([]);
  const [filterPattern, setFilterPattern] = useState([]);
  const [filterStatus, setFilterStatus] = useState([]);
  const [filterBidType, setFilterBidType] = useState([]);
  const [filterFixation, setFilterFixation] = useState([]);
  const [filterActiveHours, setFilterActiveHours] = useState([]);
  const [filterTurnover, setFilterTurnover] = useState([]);
  const [sortValue, setSortValue] = useState('spendSum:desc');
  // Выбранные кампании (id) для массовых действий.
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  // По умолчанию — данные за 2 недели по сегодняшний день включительно.
  const [dateRange, setDateRange] = useState(() => {
    const endDate = getDefaultEndDate();
    return { startDate: getDefaultStartDate(endDate), endDate };
  });
  const props = useSpring(animStyles);

  const items = useSelector(selectPromoItems(status));
  const isLoading = useSelector(selectPromoIsLoading(status));
  const isLoaded = useSelector(selectPromoIsLoaded(status));
  const loadedRange = useSelector(selectPromoRange(status));

  // Первая загрузка вкладки (один раз), как в A/B тестах.
  useEffect(() => {
    if (isLoaded) return;
    if (status === 'pending') {
      dispatch(fetchPromo({ status }));
      return;
    }
    dispatch(fetchPromo({ status, ...dateRange }));
  }, [dispatch, status, isLoaded, dateRange]);

  // Смена диапазона дат перезабирает данные «Активных» и «Завершенных».
  useEffect(() => {
    if (status === 'pending' || !isLoaded) return;
    if (
      loadedRange &&
      loadedRange.startDate === dateRange.startDate &&
      loadedRange.endDate === dateRange.endDate
    ) {
      return;
    }
    dispatch(fetchPromo({ status, ...dateRange }));
  }, [dispatch, status, isLoaded, loadedRange, dateRange]);

  // Кнопка обновления: заново запрашиваем данные текущей вкладки.
  // Слайс на время запроса ставит isLoading — таблица показывает скелетон.
  const handleRefresh = () => {
    if (status === 'pending') {
      dispatch(fetchPromo({ status }));
      return;
    }
    dispatch(fetchPromo({ status, ...dateRange }));
  };

  // Значения фильтров — из категорий/лекал/статусов уже загруженных кампаний.
  const { categoryOptions, patternOptions, statusOptions } = useMemo(() => {
    const collectField = (field) =>
      [...new Set(items.map((item) => String(item[field] || '')))].filter(
        Boolean
      );
    const optionsOf = (values) =>
      values
        .map((value) => ({ value, label: value }))
        .sort((a, b) =>
          a.label.localeCompare(b.label, 'ru', { sensitivity: 'base' })
        );
    // Статусы: числовые коды (в т.ч. отрицательные), сортировка по коду.
    const statusCodes = [
      ...new Set(items.map((item) => Number(item.status)).filter(Number.isFinite)),
    ].sort((a, b) => a - b);
    return {
      categoryOptions: optionsOf(collectField('category')),
      // Лекало: плюс вариант «Не определено» (пустое значение).
      patternOptions: [
        ...optionsOf(collectField('pattern')),
        { value: '', label: 'Не определено' },
      ],
      statusOptions: statusCodes.map((code) => ({
        value: String(code),
        label: getStatusMeta(code).label,
      })),
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!matchesQuery(item, searchQuery)) return false;
      if (
        filterCategory.length > 0 &&
        !filterCategory.includes(String(item.category))
      )
        return false;
      if (
        filterPattern.length > 0 &&
        !filterPattern.some(
          (p) => (p === '' ? !item.pattern : p === String(item.pattern))
        )
      )
        return false;
      if (
        filterStatus.length > 0 &&
        !filterStatus.includes(String(item.status))
      )
        return false;
      if (
        filterBidType.length > 0 &&
        !filterBidType.includes(String(item.bidType))
      )
        return false;
      if (
        filterFixation.length > 0 &&
        !filterFixation.includes(item.isFixed ? 'fixed' : 'unfixed')
      )
        return false;
      if (
        filterActiveHours.length > 0 &&
        !filterActiveHours.includes(item.hasActiveHours ? 'limited' : 'unlimited')
      )
        return false;
      if (
        filterTurnover.length > 0 &&
        !filterTurnover.includes(item.turnoverByBarcodes ? 'bySizes' : 'bySku')
      )
        return false;
      return true;
    });
  }, [
    items,
    searchQuery,
    filterCategory,
    filterPattern,
    filterStatus,
    filterBidType,
    filterFixation,
    filterActiveHours,
    filterTurnover,
  ]);

  const sortOptions = useMemo(
    () => createSortOptions(status === 'finished'),
    [status]
  );
  const effectiveSortValue = sortOptions.some(
    (option) => option.value === sortValue
  )
    ? sortValue
    : 'spendSum:desc';
  const sortedItems = useMemo(() => {
    const [field, direction] = effectiveSortValue.split(':');
    const getValue = (item) => {
      if (field === 'creationDatetime' || field === 'endDatetime') {
        const timestamp = new Date(item[field] || 0).getTime();
        return Number.isFinite(timestamp) ? timestamp : 0;
      }
      return Number(item[field]) || 0;
    };

    return [...filteredItems].sort((left, right) => {
      const result = getValue(left) - getValue(right);
      return direction === 'asc' ? result : -result;
    });
  }, [effectiveSortValue, filteredItems]);

  // Выставляет категорию в фильтр (добавляет, если ещё не выбрана).
  const handleCategoryFilter = (category) => {
    setFilterCategory((prev) =>
      prev.includes(String(category)) ? prev : [...prev, String(category)]
    );
  };

  // Выставляет лекало в фильтр (добавляет, если ещё не выбрано).
  const handlePatternFilter = (pattern) => {
    setFilterPattern((prev) =>
      prev.includes(String(pattern)) ? prev : [...prev, String(pattern)]
    );
  };

  // Выставляет тип кампании в фильтр (добавляет, если ещё не выбран).
  const handleBidTypeFilter = (bidType) => {
    setFilterBidType((prev) =>
      prev.includes(String(bidType)) ? prev : [...prev, String(bidType)]
    );
  };

  // Сброс поиска и фильтров (смену раздела не трогаем).
  const handleResetFilters = () => {
    setSearchQuery('');
    setSearchResetKey((n) => n + 1);
    setFilterCategory([]);
    setFilterPattern([]);
    setFilterStatus([]);
    setFilterBidType([]);
    setFilterFixation([]);
    setFilterActiveHours([]);
    setFilterTurnover([]);
  };

  // Переключение выбора одной кампании.
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Выделить все кампании, которые сейчас видит пользователь (после фильтров).
  const handleSelectAll = () => {
    setSelectedIds(new Set(sortedItems.map((item) => item.id)));
  };

  // Выбрать кампании текущего раздела по id из первой колонки Excel-файла.
  const handleImportIds = (ids) => {
    const importedIds = new Set(ids.map((id) => String(id).trim()));
    setSelectedIds(
      new Set(
        items
          .filter((item) => importedIds.has(String(item.id)))
          .map((item) => item.id)
      )
    );
  };

  // Снять выделение со всех видимых кампаний.
  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const selectedCount = selectedIds.size;
  const hasSelection = selectedCount > 0;
  // Пауза/стоп/запуск — только в «Активных»; удаление — в «Активных» и «Завершенных».
  const showRunActions = canManage && status === 'active';
  const showDeleteAction = canManage && (status === 'active' || status === 'finished');

  // Диалог подтверждения: { kind, ids, bulk, vendorcode } и модалка настроек.
  const [confirmState, setConfirmState] = useState(null);
  const [settingsItem, setSettingsItem] = useState(null);
  const [bulkSettingsOpen, setBulkSettingsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setSortValue('spendSum:desc');
  }, [status]);

  /**
   * Запускает действие над списком id, отбросив кампании с неподходящим
   * статусом (кроме удаления — там статус не важен). При успехе показывает
   * всплывающее уведомление о результате.
   */
  const runAction = (kind, ids) => {
    const conf = ACTION_CONF[kind];
    const targetIds = conf.statuses
      ? ids.filter((id) => {
          const item = items.find((it) => it.id === id);
          return item && conf.statuses.has(Number(item.status));
        })
      : ids;
    if (targetIds.length === 0) return;
    dispatch(promoAction({ action: kind, status, ids: targetIds }))
      .unwrap()
      .then(() =>
        dispatch(setNotification(successToast(kind, targetIds.length)))
      )
      .catch(() => {});
  };

  // Массовое действие из строки фильтров: сначала подтверждение.
  const handleBulkAction = (kind) => {
    if (!hasSelection) return;
    setConfirmState({ kind, ids: [...selectedIds], bulk: true });
  };

  // Одиночное действие из колонки «Действия».
  const handleRowAction = (kind, item) =>
    setConfirmState({ kind, ids: [item.id], bulk: false, vendorcode: item.vendorcode });

  const handleConfirm = () => {
    if (!confirmState) return;
    runAction(confirmState.kind, confirmState.ids);
    setConfirmState(null);
    setSelectedIds(new Set());
  };

  // Переход на детализированную страницу РК.
  const handleOpen = (item) => {
    const endDate = item.endDatetime
      ? String(item.endDatetime).slice(0, 10)
      : '';
    const suffix = endDate
      ? `?end_date=${encodeURIComponent(endDate)}`
      : '';
    window.open(`/promo/${item.id}${suffix}`, '_blank', 'noopener,noreferrer');
  };

  // Выгружает только кампании, оставшиеся после поиска и фильтров.
  const handleExportExcel = () => {
    if (isExporting || sortedItems.length === 0) return;

    setIsExporting(true);
    try {
      const dates = [];
      if (status === 'pending') {
        dates.push('');
      } else {
        const current = new Date(`${dateRange.startDate}T00:00:00`);
        const end = new Date(`${dateRange.endDate}T00:00:00`);
        while (current <= end) {
          dates.push(
            `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`
          );
          current.setDate(current.getDate() + 1);
        }
      }

      const rows = [];
      sortedItems.forEach((item) => {
        dates.forEach((date) => {
          rows.push({
            'ID РК': item.id,
            SKU: item.sku,
            Артикул: item.vendorcode,
            'Название РК': item.name,
            Дата: date,
            'Тип кампании': item.bidType === 'unified' ? 'Единая' : 'Ручная',
            Статус: getStatusMeta(Number(item.status)).label,
            Фиксация: item.isFixed ? 'Зафиксирована' : 'Не зафиксирована',
            'Ставка поиска': item.searchBid,
            'Ставка рекомендаций': item.recBid,
            Бюджет: item.budget,
            'Порог пополнения': item.budgetFloor,
            'Сумма пополнения': item.replinishmentAmount,
            'Порог показов': item.viewsBench,
            'CTR порог, %': item.ctrBench == null ? '' : Number(item.ctrBench) * 100,
            'Время активности': item.hasActiveHours
              ? `${item.startHour}:00 - ${item.pauseHour}:00`
              : 'Круглосуточно',
            'Порог оборачиваемости': item.lowerTurnoverThreshold,
            'Дней для расчёта оборачиваемости': item.turnoverDays,
            'Расчёт оборачиваемости': item.turnoverByBarcodes
              ? 'По размерам'
              : 'По артикулу',
            'Дней до фиксации метрик': item.daysToFixingMetrics,
            'Траты за день': date ? item.spend?.[date] ?? '' : '',
            'Показы за день': date ? item.views?.[date] ?? '' : '',
            'Клики за день': date ? item.clicks?.[date] ?? '' : '',
            'Добавления в корзину за день': date
              ? item.addingsToCart?.[date] ?? ''
              : '',
            'Заказы за день': date ? item.orders?.[date] ?? '' : '',
            'CTR за день, %': date ? item.ctr?.[date] ?? '' : '',
            'CR клик-корзина, %': date ? item.clickToCart?.[date] ?? '' : '',
            'CR показ-корзина, %': date ? item.viewToCart?.[date] ?? '' : '',
          });
        });
      });

      const sheet = XLSX.utils.json_to_sheet(rows);
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, sheet, 'Рекламные кампании');
      const suffix = status === 'pending' ? 'pending' : `${dateRange.startDate}_${dateRange.endDate}`;
      XLSX.writeFile(book, `promo_${suffix}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  const showCalendar = status !== 'pending';

  return (
    <animated.div style={props} className={`page ${styles.root}`}>
      <header className={`pageHeader ${styles.header}`}>
        <div className={styles.headerLeft}>
          <h1 className={`pageTitle ${styles.titleIndent}`}>Реклама</h1>
          <button
            type="button"
            className={styles.refreshBtn}
            title="Обновить раздел"
            aria-label="Обновить раздел"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <FiRefreshCw />
          </button>
        </div>
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
        {canManage && (
          <button
            type="button"
            className={styles.createBtn}
            onClick={() => window.open('/promo/create', '_blank', 'noopener,noreferrer')}
          >
            Создать РК
          </button>
        )}
      </div>

      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.refreshColsBtn}
          title="Вернуть скрытые колонки и сбросить порядок"
          onClick={() => setResetColumns((n) => n + 1)}
        >
          <IoMdRefreshCircle />
        </button>
        <button
          type="button"
          className={styles.resetFiltersBtn}
          title="Сбросить все фильтры"
          onClick={handleResetFilters}
        >
          <MdFilterAltOff />
        </button>
        <button
          type="button"
          className={styles.excelBtn}
          title="Выгрузить отфильтрованные РК в Excel"
          aria-label="Выгрузить отфильтрованные РК в Excel"
          onClick={handleExportExcel}
          disabled={isExporting || isLoading || sortedItems.length === 0}
        >
          <FaFileExcel />
        </button>
        <div className={styles.filtersScroll}>
          {status !== 'pending' && (
            <SortSelect
              options={sortOptions}
              value={effectiveSortValue}
              onChange={setSortValue}
              disabled={isLoading}
            />
          )}
          {showCalendar && (
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              minDate="2024-07-01"
              maxDate={getDefaultEndDate()}
              disabled={isLoading}
            />
          )}
          <SearchFilter
            key={searchResetKey}
            placeholder="Поиск по артикулу или SKU…"
            onSearch={setSearchQuery}
            disabled={isLoading}
          />
          <DropdownFilter
            title="Категория"
            options={categoryOptions}
            selected={filterCategory}
            onApply={setFilterCategory}
            disabled={isLoading}
          />
          <DropdownFilter
            title="Лекало"
            options={patternOptions}
            selected={filterPattern}
            onApply={setFilterPattern}
            disabled={isLoading}
          />
          <DropdownFilter
            title="Тип кампании"
            options={BID_TYPE_OPTIONS}
            selected={filterBidType}
            onApply={setFilterBidType}
            disabled={isLoading}
          />
          <DropdownFilter
            title="Фиксация"
            options={FIXATION_OPTIONS}
            selected={filterFixation}
            onApply={setFilterFixation}
            disabled={isLoading}
          />
          <DropdownFilter
            title="Время активности"
            options={ACTIVE_HOURS_OPTIONS}
            selected={filterActiveHours}
            onApply={setFilterActiveHours}
            disabled={isLoading}
          />
          <DropdownFilter
            title="Оборачиваемость"
            options={TURNOVER_OPTIONS}
            selected={filterTurnover}
            onApply={setFilterTurnover}
            disabled={isLoading}
          />
          {/* В «Завершенных» все кампании со статусом 12 — фильтр не нужен. */}
          {status !== 'finished' && (
            <DropdownFilter
              title="Статус"
              options={statusOptions}
              selected={filterStatus}
              onApply={setFilterStatus}
              disabled={isLoading}
            />
          )}
        </div>

        {/* Блок массового редактирования — справа в строке с фильтрами. */}
        {canManage && (showRunActions || showDeleteAction) ? (
          <div className={styles.bulkBlock}>
            <span className={styles.selectedCount}>
              Выбрано РК: {selectedCount}
            </span>
            {showRunActions && (
              <>
                <button
                  type="button"
                  className={styles.bulkBtn}
                  title="Поставить на паузу"
                  aria-label="Поставить на паузу"
                  disabled={!hasSelection}
                  onClick={() => handleBulkAction('pause')}
                >
                  <PiPause />
                </button>
                <button
                  type="button"
                  className={styles.bulkBtn}
                  title="Запустить"
                  aria-label="Запустить"
                  disabled={!hasSelection}
                  onClick={() => handleBulkAction('start')}
                >
                  <PiPlay />
                </button>
                <button
                  type="button"
                  className={styles.bulkBtn}
                  title="Завершить"
                  aria-label="Завершить"
                  disabled={!hasSelection}
                  onClick={() => handleBulkAction('finish')}
                >
                  <PiSkipForward />
                </button>
              </>
            )}
            {showDeleteAction && (
              <button
                type="button"
                className={styles.bulkBtnDanger}
                title="Удалить"
                aria-label="Удалить"
                disabled={!hasSelection}
                onClick={() => handleBulkAction('delete')}
              >
                <RiDeleteBin2Fill />
              </button>
            )}
            {showRunActions && (
              <button
                type="button"
                className={styles.bulkBtn}
                title="Массовые настройки"
                aria-label="Массовые настройки"
                disabled={!hasSelection}
                onClick={() => setBulkSettingsOpen(true)}
              >
                <CiSettings />
              </button>
            )}
          </div>
        ) : null}
      </div>

      <div className={styles.tableArea}>
        {status === 'pending' ? (
          <PromoTable
            items={sortedItems}
            isLoading={isLoading}
            resetTrigger={resetColumns}
            columnIds={PENDING_COLUMN_IDS}
            stretch
            compactRkInfo
            canManage={canManage}
            onDelete={(item) => handleRowAction('delete', item)}
            onSettings={setSettingsItem}
          />
        ) : (
          <PromoTable
            items={sortedItems}
            isLoading={isLoading}
            resetTrigger={resetColumns}
            columnIds={status === 'finished' ? FINISHED_COLUMN_IDS : undefined}
            onCategoryFilter={handleCategoryFilter}
            onPatternFilter={handlePatternFilter}
            onBidTypeFilter={handleBidTypeFilter}
            canSelect={canManage}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onImportIds={status === 'active' ? handleImportIds : undefined}
            canManage={canManage}
            onPause={(item) => handleRowAction('pause', item)}
            onResume={(item) => handleRowAction('start', item)}
            onFinish={(item) => handleRowAction('finish', item)}
            onDelete={(item) => handleRowAction('delete', item)}
            // Настройки недоступны в «Завершенных».
            onSettings={status === 'finished' ? null : setSettingsItem}
            onOpen={handleOpen}
          />
        )}
      </div>

      {confirmState ? (
        <div className={styles.modalOverlay} onClick={() => setConfirmState(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {ACTION_CONF[confirmState.kind].confirmTitle}
            </h3>
            {confirmState.bulk ? (
              <>
                <p className={styles.modalText}>
                  {ACTION_CONF[confirmState.kind].confirmText}
                </p>
                <p className={styles.modalCount}>
                  Кампаний: {confirmState.ids.length}
                </p>
              </>
            ) : (
              <p className={styles.modalText}>
                {ACTION_CONF[confirmState.kind].rowVerb} кампанию для артикула{' '}
                <span className={styles.modalVendor}>
                  {confirmState.vendorcode ?? '—'}
                </span>
                ? {confirmState.kind === 'delete' ? 'Действие необратимо.' : ''}
              </p>
            )}
            <div className={`${styles.modalActions} ${styles.modalActionsCenter}`}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setConfirmState(null)}
              >
                Отмена
              </button>
              <button
                type="button"
                className={styles.modalConfirm}
                onClick={handleConfirm}
              >
                {confirmState.kind === 'delete' ? 'Удалить' : 'Подтвердить'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {settingsItem ? (
        <PromoSettingsModal
          key={settingsItem.id}
          campaign={settingsItem}
          onClose={() => setSettingsItem(null)}
          onSaved={handleRefresh}
        />
      ) : null}

      {bulkSettingsOpen ? (
        <PromoBulkSettingsModal
          ids={[...selectedIds]}
          onClose={() => setBulkSettingsOpen(false)}
          onSaved={() => {
            setSelectedIds(new Set());
            handleRefresh();
          }}
        />
      ) : null}
    </animated.div>
  );
};

export default PromoPage;
