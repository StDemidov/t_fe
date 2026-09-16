import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoMdRefreshCircle } from 'react-icons/io';
import { MdFilterAltOff } from 'react-icons/md';
import { FaFileExcel, FaTag } from 'react-icons/fa';
import * as XLSX from 'xlsx';

import { selectUser } from '../../redux/slices/authSlice';
import {
  fetchSkusMetrics,
  selectSkusMetricsItems,
  selectSkusMetricsIsLoading,
  getDefaultStartDate,
  getDefaultEndDate,
} from '../../entities/sku-metrics';
import { fetchSkusMetrics as fetchSkusMetricsRaw } from '../../entities/sku-metrics/api/fetchSkusMetrics';
import { fetchTags } from '../../entities/tags';

import '../../app/styles/global.css';
import { SkusTable } from '../../widgets/skus-table';
import {
  SearchFilter,
  DateRangePicker,
  DropdownFilter,
  SortSelect,
  TagsManagerModal,
} from '../../shared/ui';
import styles from './SkusPage.module.css';

/** Чисто числовой запрос = поиск по sku, буквенно-числовой = по vendorCode. */
const isNumeric = (query) => /^\d+$/.test(query);

const matchesQuery = (item, query) => {
  if (!query) return true;
  const q = query.toLowerCase();
  if (isNumeric(query)) {
    return String(item.sku).includes(query);
  }
  return String(item.vendorCode || '')
    .toLowerCase()
    .includes(q);
};

/** Варианты сортировки по предвычисленным полям артикула. */
const SORT_OPTIONS = [
  // Заказы
  { value: 'ordersSumFbs:asc', label: 'Заказы FBS' },
  { value: 'ordersSumFbs:desc', label: 'Заказы FBS' },
  { value: 'ordersSumFbw:asc', label: 'Заказы FBW' },
  { value: 'ordersSumFbw:desc', label: 'Заказы FBW' },
  { value: 'ordersSum:asc', label: 'Заказы суммарно' },
  { value: 'ordersSum:desc', label: 'Заказы суммарно' },
  // Продажи
  { value: 'salesSumFbs:asc', label: 'Продажи FBS' },
  { value: 'salesSumFbs:desc', label: 'Продажи FBS' },
  { value: 'salesSumFbw:asc', label: 'Продажи FBW' },
  { value: 'salesSumFbw:desc', label: 'Продажи FBW' },
  { value: 'salesSum:asc', label: 'Продажи суммарно' },
  { value: 'salesSum:desc', label: 'Продажи суммарно' },
  // EBITDA/день
  { value: 'ebitdaDayFbs:asc', label: 'EBITDA/день FBS' },
  { value: 'ebitdaDayFbs:desc', label: 'EBITDA/день FBS' },
  { value: 'ebitdaDayFbw:asc', label: 'EBITDA/день FBW' },
  { value: 'ebitdaDayFbw:desc', label: 'EBITDA/день FBW' },
  { value: 'ebitdaDay:asc', label: 'EBITDA/день суммарно' },
  { value: 'ebitdaDay:desc', label: 'EBITDA/день суммарно' },
  // Остатки (последнее значение)
  { value: 'stocksLastFbs:asc', label: 'Остатки FBS' },
  { value: 'stocksLastFbs:desc', label: 'Остатки FBS' },
  { value: 'stocksLastFbw:asc', label: 'Остатки FBW' },
  { value: 'stocksLastFbw:desc', label: 'Остатки FBW' },
  { value: 'stocksLast:asc', label: 'Остатки суммарно' },
  { value: 'stocksLast:desc', label: 'Остатки суммарно' },
  // Рекламные расходы
  { value: 'adsCostsSum:asc', label: 'Рекл. расходы' },
  { value: 'adsCostsSum:desc', label: 'Рекл. расходы' },
  // ROI
  { value: 'roi:asc', label: 'ROI' },
  { value: 'roi:desc', label: 'ROI' },
  // Дата старта продаж
  { value: 'startOfRealizationDate:desc', label: 'По дате старта продаж (свежие → старые)' },
  { value: 'startOfRealizationDate:asc', label: 'По дате старта продаж (старые → свежие)' },
];

const SkusPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const items = useSelector(selectSkusMetricsItems);
  const isLoading = useSelector(selectSkusMetricsIsLoading);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMainTags, setFilterMainTags] = useState([]);
  const [filterClothTags, setFilterClothTags] = useState([]);
  const [filterOtherTags, setFilterOtherTags] = useState([]);
  const [filterCategory, setFilterCategory] = useState([]);
  const [filterPattern, setFilterPattern] = useState([]);
  const [filterStyle, setFilterStyle] = useState([]);
  const [filterAbcAll, setFilterAbcAll] = useState([]);
  const [filterAbcCat, setFilterAbcCat] = useState([]);
  const [sortValue, setSortValue] = useState('ebitdaDay:desc');
  // Счётчик сброса порядка/видимости колонок таблицы.
  const [resetColumns, setResetColumns] = useState(0);
  // Ключ перезапуска поисковой строки при сбросе фильтров.
  const [searchResetKey, setSearchResetKey] = useState(0);
  // Флаг загрузки выгрузки Excel.
  const [isExporting, setIsExporting] = useState(false);
  // Открыто ли окно управления тегами.
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  // По умолчанию — данные за 2 недели по вчерашний день включительно.
  const [dateRange, setDateRange] = useState(() => {
    const endDate = getDefaultEndDate();
    return { startDate: getDefaultStartDate(endDate), endDate };
  });

  useEffect(() => {
    dispatch(fetchSkusMetrics(dateRange));
  }, [dispatch, dateRange]);

  // Отдельный запрос всех тегов — нужен дальше для привязки тегов к артикулам.
  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  // Значения для фильтров берём только из тегов/категорий/лекал/стилей,
  // уже присутствующих у артикулов.
  const {
    mainTagOptions,
    clothTagOptions,
    otherTagOptions,
    categoryOptions,
    patternOptions,
    styleOptions,
    abcAllOptions,
    abcCatOptions,
  } = useMemo(() => {
    const collectArray = (field) => [
      ...new Set(items.flatMap((item) => (item[field] || []).map(String))),
    ];
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
    return {
      mainTagOptions: optionsOf(collectArray('mainTags')),
      clothTagOptions: optionsOf(collectArray('clothTags')),
      otherTagOptions: optionsOf(collectArray('otherTags')),
      categoryOptions: optionsOf(collectField('category')),
      // Лекало: плюс вариант «Не определено» (пустое значение).
      patternOptions: [
        ...optionsOf(collectField('pattern')),
        { value: '', label: 'Не определено' },
      ],
      styleOptions: optionsOf(collectField('style')),
      abcAllOptions: optionsOf(collectField('abcAmongAllCurrent')),
      abcCatOptions: optionsOf(collectField('abcAmongCategoryCurrent')),
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const matches = (list, values) =>
      values.length === 0 ||
      values.some(
        (v) => list.includes(v) || String(list).split(',').includes(v)
      );
    return items.filter((item) => {
      if (!matchesQuery(item, searchQuery)) return false;
      if (!matches(item.mainTags || [], filterMainTags)) return false;
      if (!matches(item.clothTags || [], filterClothTags)) return false;
      if (!matches(item.otherTags || [], filterOtherTags)) return false;
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
      if (filterStyle.length > 0 && !filterStyle.includes(String(item.style)))
        return false;
      if (
        filterAbcAll.length > 0 &&
        !filterAbcAll.includes(String(item.abcAmongAllCurrent))
      )
        return false;
      if (
        filterAbcCat.length > 0 &&
        !filterAbcCat.includes(String(item.abcAmongCategoryCurrent))
      )
        return false;
      return true;
    });
  }, [
    items,
    searchQuery,
    filterMainTags,
    filterClothTags,
    filterOtherTags,
    filterCategory,
    filterPattern,
    filterStyle,
    filterAbcAll,
    filterAbcCat,
  ]);

  // Сортировка по одному выбранному полю.
  const sortedItems = useMemo(() => {
    if (!sortValue) return filteredItems;
    const [field, dir] = sortValue.split(':');
    const mul = dir === 'desc' ? -1 : 1;
    const isDateField = field === 'startOfRealizationDate';
    return [...filteredItems].sort((a, b) => {
      if (isDateField) {
        const va = String(a[field] || '');
        const vb = String(b[field] || '');
        if (va === vb) return 0;
        if (!va) return 1;
        if (!vb) return -1;
        return (va < vb ? -1 : 1) * mul;
      }
      return ((Number(a[field]) || 0) - (Number(b[field]) || 0)) * mul;
    });
  }, [filteredItems, sortValue]);

  // Выставляет кликнутый тег в соответствующий фильтр-список.
  const tagFilterSetters = {
    main: setFilterMainTags,
    cloth: setFilterClothTags,
    others: setFilterOtherTags,
  };
  const handleTagFilter = (tag, type) => {
    const setter = tagFilterSetters[type];
    if (!setter) return;
    setter((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
  };

  // Убирает удалённые теги из выбранных значений фильтров по тегам.
  const handleTagsRemoved = (removed) => {
    const namesByType = { main: [], cloth: [], others: [] };
    removed.forEach(({ tag_name, type }) => {
      if (namesByType[type]) namesByType[type].push(String(tag_name));
    });
    const drop = (prev, list) =>
      list.length ? prev.filter((t) => !list.includes(String(t))) : prev;
    setFilterMainTags((prev) => drop(prev, namesByType.main));
    setFilterClothTags((prev) => drop(prev, namesByType.cloth));
    setFilterOtherTags((prev) => drop(prev, namesByType.others));
  };

  // Выставляет категорию в фильтр «Категория» (добавляет, если ещё не выбран).
  const handleCategoryFilter = (category) => {
    setFilterCategory((prev) =>
      prev.includes(String(category)) ? prev : [...prev, String(category)]
    );
  };

  // Выставляет лекало в фильтр «Лекало» (добавляет, если ещё не выбран).
  const handlePatternFilter = (pattern) => {
    setFilterPattern((prev) =>
      prev.includes(String(pattern)) ? prev : [...prev, String(pattern)]
    );
  };

  // Выставляет значение ABC-плашки в соответствующий фильтр (бренд/категория).
  const handleAbcFilter = (field) => (value) => {
    const setter = field === 'abcAmongAllCurrent' ? setFilterAbcAll : setFilterAbcCat;
    setter((prev) =>
      prev.includes(String(value)) ? prev : [...prev, String(value)]
    );
  };

  // Сброс всех выбранных фильтров (сортировку не трогаем).
  const handleResetFilters = () => {
    setSearchQuery('');
    setSearchResetKey((n) => n + 1);
    setFilterMainTags([]);
    setFilterClothTags([]);
    setFilterOtherTags([]);
    setFilterCategory([]);
    setFilterPattern([]);
    setFilterStyle([]);
    setFilterAbcAll([]);
    setFilterAbcCat([]);
  };

  // Хелперы выгрузки Excel.
  // Значение из словаря {дата: значение} за конкретную дату.
  const at = (item, date, key) => {
    const v = item[key];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const raw = v[date];
      return raw === null || raw === undefined ? null : raw;
    }
    return v === null || v === undefined ? null : v;
  };
  // Сумма значений нескольких полей за дату.
  const byDate = (item, date, ...keys) =>
    keys.reduce((sum, k) => sum + (Number(at(item, date, k)) || 0), 0);
  // Процент numerator / denominator (×100); пусто при делении на 0.
  const ratio = (num, den) => {
    if (num === null || num === undefined || den === null || den === undefined)
      return '';
    const d = Number(den);
    if (d === 0) return '';
    return Math.round((Number(num) / d) * 10000) / 100;
  };
  // Список тегов через запятую.
  const joinTags = (tags) =>
    Array.isArray(tags) ? tags.filter(Boolean).join(', ') : '';
  // Медианное значение по дням (для ROI).
  const medianDailyExcel = (daily) => {
    if (!daily) return 0;
    const vals = Object.values(daily)
      .map(Number)
      .filter((v) => Number.isFinite(v));
    if (vals.length === 0) return 0;
    const sorted = [...vals].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  };
  // ROI артикула в процентах — как в таблице:
  // (avgEbitda − avgCps) / себестоимость без НДС, ×100, два знака.
  const roiPercentOf = (it) => {
    const ordersByDate = {};
    for (const date of new Set([
      ...Object.keys(it.ordersFbs || {}),
      ...Object.keys(it.ordersFbw || {}),
    ])) {
      ordersByDate[date] =
        (Number(it.ordersFbs[date]) || 0) + (Number(it.ordersFbw[date]) || 0);
    }
    const totalOrders = Object.values(ordersByDate).reduce(
      (s, v) => s + (Number(v) || 0),
      0
    );
    const totalAdsCosts = Object.values(it.adsCosts || {}).reduce(
      (s, v) => s + (Number(v) || 0),
      0
    );
    const avgCpo =
      totalOrders !== 0 ? Math.round(totalAdsCosts / totalOrders) : 0;
    const buyoutByDate = {};
    for (const date of Object.keys(it.buyoutPercent || {})) {
      const raw = Number(it.buyoutPercent[date]);
      buyoutByDate[date] = Number.isFinite(raw) ? raw / 100 : null;
    }
    const medianBuyout = medianDailyExcel(buyoutByDate);
    const avgCps =
      medianBuyout !== 0 ? Math.round(avgCpo / medianBuyout) : 0;
    const ebitdaVals = Object.values(it.ebitda || {});
    const avgEbitda = ebitdaVals.length
      ? ebitdaVals.reduce((s, v) => s + (Number(v) || 0), 0) /
        ebitdaVals.length
      : 0;
    const cost = Number(it.selfpriceWithoutNds);
    if (
      !Number.isFinite(Number(avgEbitda)) ||
      !Number.isFinite(Number(avgCps)) ||
      !Number.isFinite(cost) ||
      cost === 0
    ) {
      return null;
    }
    return Math.round(((avgEbitda - avgCps) / cost) * 100 * 100) / 100;
  };
  // Ячейка: null/undefined/NaN → пустая строка.
  const cell = (value) => {
    if (value === null || value === undefined) return '';
    const num = Number(value);
    return Number.isFinite(num) ? num : value;
  };

  // Выгрузка данных в Excel. Для каждого артикула создаётся строка на каждую
  // дату диапазона; поля-словари {дата: значение} берут значение за дату,
  // остальные — дублируются. Поля с тегами выводятся списком через запятую.
  const handleExportExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const list = await fetchSkusMetricsRaw(dateRange);
      if (!Array.isArray(list) || list.length === 0) return;

      // Порядок колонок выгрузки. value — функция (item, date) => ячейка.
      const COLUMNS = [
        { label: 'SKU', value: (it) => it.sku },
        { label: 'Старт продаж', value: (it) => it.startOfRealizationDate },
        { label: 'Артикул', value: (it) => it.vendorCode },
        { label: 'Дата', value: (_it, date) => date },
        { label: 'Категория', value: (it) => it.category },
        { label: 'Стиль', value: (it) => it.style },
        { label: 'Страна', value: (it) => it.countryOfOrigin },
        { label: 'лекало', value: (it) => it.pattern },
        { label: 'Заказы (всего)', value: (it, d) => byDate(it, d, 'ordersFbw', 'ordersFbs') },
        { label: 'Заказы FBS', value: (it, d) => at(it, d, 'ordersFbs') },
        { label: 'Заказы FBW', value: (it, d) => at(it, d, 'ordersFbw') },
        { label: 'Продажи (всего)', value: (it, d) => byDate(it, d, 'salesFbw', 'salesFbs') },
        { label: 'Продажи FBS', value: (it, d) => at(it, d, 'salesFbs') },
        { label: 'Продажи FBW', value: (it, d) => at(it, d, 'salesFbw') },
        { label: 'Остатки (всего)', value: (it, d) => byDate(it, d, 'stocksFbw', 'stocksFbs') },
        { label: 'Остатки FBS', value: (it, d) => at(it, d, 'stocksFbs') },
        { label: 'Остатки FBW', value: (it, d) => at(it, d, 'stocksFbw') },
        {
          label: 'EBITDA/День (всего)',
          value: (it, d) => byDate(it, d, 'totalEbitdaFbw', 'totalEbitdaFbs'),
        },
        { label: 'EBITDA/день FBS', value: (it, d) => at(it, d, 'totalEbitdaFbs') },
        { label: 'EBITDA/день FBW', value: (it, d) => at(it, d, 'totalEbitdaFbw') },
        { label: 'Цена до СПП', value: (it, d) => at(it, d, 'price') },
        { label: 'EBITDA', value: (it, d) => at(it, d, 'ebitda') },
        { label: 'Рекламные расходы', value: (it, d) => at(it, d, 'adsCosts') },
        { label: 'процент выкупа', value: (it, d) => at(it, d, 'buyoutPercent') },
        { label: 'Клики', value: (it, d) => at(it, d, 'clicks') },
        { label: 'Добавления в корзину', value: (it, d) => at(it, d, 'addingsToCart') },
        {
          label: 'CR из клика в корзину',
          value: (it, d) =>
            ratio(at(it, d, 'addingsToCart'), at(it, d, 'clicks')),
        },
        {
          label: 'CR из корзины в заказ',
          value: (it, d) =>
            ratio(byDate(it, d, 'ordersFbw', 'ordersFbs'), at(it, d, 'addingsToCart')),
        },
        {
          label: 'CR из клика в заказ',
          value: (it, d) =>
            ratio(byDate(it, d, 'ordersFbw', 'ordersFbs'), at(it, d, 'clicks')),
        },
        { label: 'ABC (бренд)', value: (it, d) => at(it, d, 'abcAmongAll') },
        { label: 'ABC (категория)', value: (it, d) => at(it, d, 'abcAmongCategory') },
        { label: 'CPO', value: (it, d) => at(it, d, 'cpo') },
        { label: 'CPS', value: (it, d) => at(it, d, 'cps') },
        { label: 'ROI (%)', value: (it) => roiPercentOf(it) },
        { label: 'Себестоимость с НДС', value: (it) => it.selfpriceWithNds },
        { label: 'Себестоимость без НДС', value: (it) => it.selfpriceWithoutNds },
        { label: 'Теги (основные)', value: (it) => joinTags(it.mainTags) },
        { label: 'Теги (ткань)', value: (it) => joinTags(it.clothTags) },
        { label: 'Теги (доп)', value: (it) => joinTags(it.otherTags) },
      ];

      // Набор дат из всех дневных полей артикула.
      const collectDates = (item) => {
        const dates = [];
        const seen = new Set();
        for (const k of Object.keys(item)) {
          const v = item[k];
          if (!v || typeof v !== 'object' || Array.isArray(v)) continue;
          for (const d of Object.keys(v)) {
            if (!seen.has(d)) {
              seen.add(d);
              dates.push(d);
            }
          }
        }
        return dates;
      };

      const rows = [];
      list.forEach((item) => {
        const dates = collectDates(item);
        const roi = roiPercentOf(item);
        dates.forEach((date) => {
          const row = {};
          COLUMNS.forEach((col) => {
            row[col.label] =
              col.label === 'ROI (%)' ? cell(roi) : cell(col.value(item, date));
          });
          rows.push(row);
        });
      });

      const sheet = XLSX.utils.json_to_sheet(rows);
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, sheet, 'SKU');
      const fname = `skus_metrics_${dateRange.startDate}_${dateRange.endDate}.xlsx`;
      XLSX.writeFile(book, fname);
    } finally {
      setIsExporting(false);
    }
  };

  if (
    user?.permissions?.is_admin !== true &&
    user?.permissions?.vendorcodes !== true
  ) {
    return (
      <div className={`page ${styles.root}`}>
        <p className={styles.forbidden}>Для доступа не достаточно прав.</p>
      </div>
    );
  }

  return (
    <div className={`page ${styles.root}`}>
      <header className="pageHeader">
        <h1 className="pageTitle">Товары</h1>
      </header>

      {isLoading ? (
        <div className={styles.skeleton}>
          <div className={styles.skeletonFilters}>
            <div className={styles.skeletonActions}>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`${styles.skeletonBlock} ${styles.skeletonBtn}`}
                />
              ))}
            </div>
            <span
              className={`${styles.skeletonBlock} ${styles.skeletonDate}`}
            />
            <span
              className={`${styles.skeletonBlock} ${styles.skeletonSearch}`}
            />
            <span
              className={`${styles.skeletonBlock} ${styles.skeletonSort}`}
            />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <span
                key={i}
                className={`${styles.skeletonBlock} ${styles.skeletonSelect}`}
              />
            ))}
          </div>
          <div className={styles.skeletonTable}>
            <div
              className={`${styles.skeletonBlock} ${styles.skeletonTableBody}`}
            />
          </div>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.filtersRow}>
            <div className={styles.actionsButtons}>
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
                className={styles.excelBtn}
                title="Выгрузить данные в Excel"
                onClick={handleExportExcel}
                disabled={isExporting || isLoading}
              >
                <FaFileExcel />
              </button>
              <button
                type="button"
                className={styles.resetFiltersBtn}
                title="Сбросить все фильтры"
                onClick={handleResetFilters}
              >
                <MdFilterAltOff />
              </button>
              {user?.permissions?.is_admin === true ||
              user?.permissions?.tags_create === true ? (
                <button
                  type="button"
                  className={styles.tagsBtn}
                  title="Управление тегами"              onClick={() => setTagsModalOpen(true)}
                  disabled={isLoading}
                >
                  <FaTag />
                </button>
              ) : null}
            </div>
            <TagsManagerModal
              open={tagsModalOpen}
              onClose={() => setTagsModalOpen(false)}
              onTagsRemoved={handleTagsRemoved}
              skuList={items.map((it) => String(it.sku))}
            />
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              minDate="2024-07-01"
              maxDate={getDefaultEndDate()}
              disabled={isLoading}
            />
            <SearchFilter
              key={searchResetKey}
              placeholder="Поиск по артикулу…"
              onSearch={setSearchQuery}
              disabled={isLoading}
            />
            <SortSelect
              options={SORT_OPTIONS}
              value={sortValue}
              onChange={setSortValue}
              disabled={isLoading}
            />
            <DropdownFilter
              title="Теги"
              options={mainTagOptions}
              selected={filterMainTags}
              onApply={setFilterMainTags}
              disabled={isLoading}
            />
            <DropdownFilter
              title="Теги (ткань)"
              options={clothTagOptions}
              selected={filterClothTags}
              onApply={setFilterClothTags}
              disabled={isLoading}
            />
            <DropdownFilter
              title="Теги (доп)"
              options={otherTagOptions}
              selected={filterOtherTags}
              onApply={setFilterOtherTags}
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
              title="Стиль"
              options={styleOptions}
              selected={filterStyle}
              onApply={setFilterStyle}
              disabled={isLoading}
            />
            <DropdownFilter
              title="ABC (бренд)"
              options={abcAllOptions}
              selected={filterAbcAll}
              onApply={setFilterAbcAll}
              disabled={isLoading}
            />
            <DropdownFilter
              title="ABC (кат.)"
              options={abcCatOptions}
              selected={filterAbcCat}
              onApply={setFilterAbcCat}
              disabled={isLoading}
            />
          </div>

          <div className={styles.tableArea}>
            <SkusTable
              items={sortedItems}
              footerItems={filteredItems}
              onTagFilter={handleTagFilter}
              onCategoryFilter={handleCategoryFilter}
              onPatternFilter={handlePatternFilter}
              onAbcAllFilter={handleAbcFilter('abcAmongAllCurrent')}
              onAbcCategoryFilter={handleAbcFilter('abcAmongCategoryCurrent')}
              resetTrigger={resetColumns}
            />
            {isExporting && (
              <div className={styles.exportOverlay}>
                <div className={styles.exportBar}>
                  <span className={styles.exportSpinner} />
                  <span className={styles.exportText}>
                    Формирование отчёта…
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkusPage;
