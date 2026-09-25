import { useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSpring, animated } from '@react-spring/web';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

import '../../app/styles/global.css';

import {
  fetchOrdersToProcessors,
  selectOrdersToProcessorsItems,
  selectOrdersToProcessorsIsLoading,
  selectExtraOrders,
  selectStartCalcDates,
  getDefaultStartDate,
  getDefaultEndDate,
  updateExtraOrder,
  clearExtraOrders,
  setStartCalcDates,
  updateStartCalcDate,
  clearStartCalcDates,
} from '../../entities/orders-to-processors';
import { isValidDateFormat } from '../../widgets/orders-to-processors/lib/gantt';

import OrdersToProcessorsToolbar from '../../widgets/orders-to-processors/OrdersToProcessorsToolbar';
import GanttHeader from '../../widgets/orders-to-processors/GanttHeader';
import SkuPlantRow from '../../widgets/orders-to-processors/SkuPlantRow';
import OrdersToProcessorsSkeleton from '../../widgets/orders-to-processors/OrdersToProcessorsSkeleton';

import { useOrdersToProcessorsData } from './hooks/useOrdersToProcessorsData';
import styles from './OrdersToProcessorsPage.module.css';

const OrdersToProcessorsPage = () => {
  const dispatch = useDispatch();

  // ── Data from Redux ──
  const items = useSelector(selectOrdersToProcessorsItems);
  const isLoading = useSelector(selectOrdersToProcessorsIsLoading);
  const extraOrders = useSelector(selectExtraOrders);
  const startCalcDates = useSelector(selectStartCalcDates);

  // ── Local filter state (не персистим — живёт на странице) ──
  const [dateRange, setDateRange] = useState(() => {
    const endDate = getDefaultEndDate();
    return { startDate: getDefaultStartDate(endDate), endDate };
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [categories, setCategories] = useState([]);
  const [tagsMain, setTagsMain] = useState([]);
  const [tagsCloth, setTagsCloth] = useState([]);
  const [tagsOther, setTagsOther] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [countries, setCountries] = useState([]);
  const [abcAll, setAbcAll] = useState([]);
  const [abcCat, setAbcCat] = useState([]);
  const [onlyFilled, setOnlyFilled] = useState(false);
  const [orderNames, setOrderNames] = useState([]);
  const [sortValue, setSortValue] = useState('totalEbitdaAvg:desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // ── Fetch на каждый новый диапазон дат ──
  useEffect(() => {
    dispatch(fetchOrdersToProcessors(dateRange));
  }, [dispatch, dateRange]);

  // Возврат на первую страницу при любом изменении фильтров/сортировки
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    categories,
    tagsMain,
    tagsCloth,
    tagsOther,
    patterns,
    countries,
    abcAll,
    abcCat,
    onlyFilled,
    orderNames,
    sortValue,
  ]);

  const {
    filteredSkuList,
    currentPageData,
    totalPages,
    totalCount,
    weeks,
    months,

    optionCategories,
    optionTagsMain,
    optionTagsCloth,
    optionTagsOther,
    optionPatterns,
    optionCountries,
    optionAbcAll,
    optionAbcCat,
    optionOrderNames,
  } = useOrdersToProcessorsData({
    items,
    searchQuery,
    categories,
    tagsMain,
    tagsCloth,
    tagsOther,
    patterns,
    countries,
    abcAll,
    abcCat,
    orderNames,
    onlyFilled,
    extraOrders,
    sortValue,
    currentPage,
    pageSize,
  });

  // ── Вводы пользователя ──
  const handleExtraOrderChange = useCallback(
    (chartId, value) => {
      dispatch(updateExtraOrder({ chartId, value: Number(value) || 0 }));
    },
    [dispatch]
  );

  const handleStartCalcDateChange = useCallback(
    (vendorCode, value) => {
      if (isValidDateFormat(value))
        dispatch(updateStartCalcDate({ vendorCode, date: value }));
    },
    [dispatch]
  );

  const handleApplyStartCalcDateToAll = useCallback(
    (vendorCode, skuList) => {
      const date = startCalcDates[vendorCode];
      if (!date) return;
      dispatch(
        setStartCalcDates(
          Object.fromEntries(skuList.map((s) => [s.vendorCode, date]))
        )
      );
    },
    [dispatch, startCalcDates]
  );

  const handleClearRow = useCallback(
    (sku) => {
      sku.sizes.forEach((c) =>
        dispatch(updateExtraOrder({ chartId: c.chartId, value: 0 }))
      );
      dispatch(updateStartCalcDate({ vendorCode: sku.vendorCode, date: null }));
    },
    [dispatch]
  );

  const handleResetDates = useCallback(() => {
    dispatch(clearStartCalcDates());
  }, [dispatch]);

  const handleResetOrders = useCallback(() => {
    dispatch(clearExtraOrders());
  }, [dispatch]);

  // Сброс всех выбранных фильтров (сортировку и введённые заказы не трогаем).
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSearchResetKey((n) => n + 1);
    setCategories([]);
    setTagsMain([]);
    setTagsCloth([]);
    setTagsOther([]);
    setPatterns([]);
    setCountries([]);
    setAbcAll([]);
    setAbcCat([]);
    setOnlyFilled(false);
    setOrderNames([]);
  }, []);

  // Кнопки фильтра на плашках карточки — как в Товарах (добавление в фильтр).
  const handleCategoryFilter = useCallback((category) => {
    setCategories((prev) =>
      prev.includes(String(category)) ? prev : [...prev, String(category)]
    );
  }, []);

  const handlePatternFilter = useCallback((pattern) => {
    setPatterns((prev) =>
      prev.includes(String(pattern)) ? prev : [...prev, String(pattern)]
    );
  }, []);

  const handleCountryFilter = useCallback((country) => {
    setCountries((prev) =>
      prev.includes(String(country)) ? prev : [...prev, String(country)]
    );
  }, []);

  // ── Сумма заказов (шапка) и наличие изменений ──
  const totalNewOrders = useMemo(() => {
    const filterChartIds = new Set(
      filteredSkuList.flatMap((sku) => sku.sizes.map((c) => c.chartId))
    );
    return Object.entries(extraOrders).reduce(
      (acc, [chartId, v]) => (filterChartIds.has(chartId) ? acc + v : acc),
      0
    );
  }, [extraOrders, filteredSkuList]);

  const hasDates = Object.keys(startCalcDates).length > 0;
  const hasOrders = Object.values(extraOrders).some((v) => Number(v) > 0);

  // ── Экспорт (предварительная версия — формат уточняется) ──
  const handleExportXls = useCallback(async () => {
    const byPattern = {};

    Object.entries(extraOrders).forEach(([chartId, value]) => {
      if (!value || Number(value) <= 0) return;
      const sku = items.find((s) => s.sizes.some((c) => c.chartId === chartId));
      if (!sku) return;
      const sizeChart = sku.sizes.find((c) => c.chartId === chartId);
      const pattern = sku.pattern || 'Без лекала';
      if (!byPattern[pattern]) byPattern[pattern] = [];
      byPattern[pattern].push({
        size: sizeChart?.size || chartId,
        qty: Math.round(Number(value)),
        sku: sku.sku,
        vendorCode: sku.vendorCode,
      });
    });

    const patternsList = Object.keys(byPattern);
    if (patternsList.length === 0) return;

    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(
      today.getMonth() + 1
    ).padStart(2, '0')}.${today.getFullYear()}`;

    const buildXlsx = (rows) => {
      const wsData = [
        ['Размер', 'Количество', '', 'SKU', 'Артикул'],
        ...rows.map((r) => [r.size, r.qty, '', r.sku, r.vendorCode]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Лист1');
      return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    };

    const downloadBlob = (blob, name) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    };

    if (patternsList.length === 1) {
      const pattern = patternsList[0];
      const rows = byPattern[pattern];
      const totalQty = rows.reduce((s, r) => s + r.qty, 0);
      const buf = buildXlsx(rows);
      downloadBlob(
        new Blob([buf], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        `${pattern}_${totalQty}_dozakaz_${dateStr}.xlsx`
      );
    } else {
      const zip = new JSZip();
      patternsList.forEach((pattern) => {
        const rows = byPattern[pattern];
        const totalQty = rows.reduce((s, r) => s + r.qty, 0);
        zip.file(
          `${pattern}_${totalQty}_dozakaz_${dateStr}.xlsx`,
          buildXlsx(rows)
        );
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `Дозаказы по размерам (${dateStr}).zip`);
    }
  }, [extraOrders, items]);

  const animStyles = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 300 },
  });

  if (isLoading) {
    return (
      <div className={`page ${styles.root}`}>
        <header className="pageHeader">
          <h1 className={`pageTitle ${styles.titleIndent}`}>Расчет дозаказов</h1>
        </header>
        <OrdersToProcessorsSkeleton />
      </div>
    );
  }

  if (currentPageData.length === 0) {
    return (
      <div className={`page ${styles.root}`}>
        <header className="pageHeader">
          <h1 className={`pageTitle ${styles.titleIndent}`}>Расчет дозаказов</h1>
        </header>
        <OrdersToProcessorsToolbar
          date={dateRange}
          onDateRangeChange={setDateRange}
          onSearch={setSearchQuery}
          sortValue={sortValue}
          onSortChange={setSortValue}
          categories={categories}
          onCategoriesChange={setCategories}
          tagsMain={tagsMain}
          onTagsMainChange={setTagsMain}
          tagsCloth={tagsCloth}
          onTagsClothChange={setTagsCloth}
          tagsOther={tagsOther}
          onTagsOtherChange={setTagsOther}
          patterns={patterns}
          onPatternsChange={setPatterns}
          countries={countries}
          onCountriesChange={setCountries}
          abcAll={abcAll}
          onAbcAllChange={setAbcAll}
          abcCat={abcCat}
          onAbcCatChange={setAbcCat}
          optionCategories={optionCategories}
          optionTagsMain={optionTagsMain}
          optionTagsCloth={optionTagsCloth}
          optionTagsOther={optionTagsOther}
          optionPatterns={optionPatterns}
          optionCountries={optionCountries}
          optionAbcAll={optionAbcAll}
          optionAbcCat={optionAbcCat}
          onlyFilled={onlyFilled}
          onOnlyFilledChange={setOnlyFilled}
          orderNames={orderNames}
          onOrderNamesChange={setOrderNames}
          optionOrderNames={optionOrderNames}
          onResetDates={handleResetDates}
          hasDates={hasDates}
          onResetOrders={handleResetOrders}
          hasOrders={hasOrders}
          onResetFilters={handleResetFilters}
          searchResetKey={searchResetKey}
          onExportXls={handleExportXls}
          currentPage={1}
          totalPages={1}
          totalCount={0}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          onPageChange={setCurrentPage}
          disabled={items.length === 0}
        />
        <div className={styles.emptyState}>Ничего не найдено</div>
      </div>
    );
  }

  return (
    <animated.div style={animStyles} className={`page ${styles.root}`}>
      <header className="pageHeader">
        <h1 className={`pageTitle ${styles.titleIndent}`}>Расчет дозаказов</h1>
      </header>

      <OrdersToProcessorsToolbar
        date={dateRange}
        onDateRangeChange={setDateRange}
        onSearch={setSearchQuery}
        sortValue={sortValue}
        onSortChange={setSortValue}
        categories={categories}
        onCategoriesChange={setCategories}
        tagsMain={tagsMain}
        onTagsMainChange={setTagsMain}
        tagsCloth={tagsCloth}
        onTagsClothChange={setTagsCloth}
        tagsOther={tagsOther}
        onTagsOtherChange={setTagsOther}
        patterns={patterns}
        onPatternsChange={setPatterns}
        countries={countries}
        onCountriesChange={setCountries}
        abcAll={abcAll}
        onAbcAllChange={setAbcAll}
        abcCat={abcCat}
        onAbcCatChange={setAbcCat}
        optionCategories={optionCategories}
        optionTagsMain={optionTagsMain}
        optionTagsCloth={optionTagsCloth}
        optionTagsOther={optionTagsOther}
        optionPatterns={optionPatterns}
        optionCountries={optionCountries}
        optionAbcAll={optionAbcAll}
        optionAbcCat={optionAbcCat}
        onlyFilled={onlyFilled}
        onOnlyFilledChange={setOnlyFilled}
        orderNames={orderNames}
        onOrderNamesChange={setOrderNames}
        optionOrderNames={optionOrderNames}
        onResetDates={handleResetDates}
        hasDates={hasDates}
        onResetOrders={handleResetOrders}
        hasOrders={hasOrders}
        onResetFilters={handleResetFilters}
        searchResetKey={searchResetKey}
        onExportXls={handleExportXls}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        onPageChange={setCurrentPage}
      />

      <div className={styles.ganttScope}>
        <GanttHeader weeks={weeks} months={months} totalNewOrders={totalNewOrders} />

        <div className={styles.skuList}>
          {currentPageData.map((sku) => (
            <SkuPlantRow
              key={sku.id}
              sku={sku}
              weeks={weeks}
              months={months}
              extraOrders={extraOrders}
              startCalcDates={startCalcDates}
              fullSkuList={filteredSkuList}
              onExtraOrderChange={handleExtraOrderChange}
              onStartCalcDateChange={handleStartCalcDateChange}
              onApplyStartCalcDateToAll={handleApplyStartCalcDateToAll}
              onClearRow={handleClearRow}
              onCategoryFilter={handleCategoryFilter}
              onPatternFilter={handlePatternFilter}
              onCountryFilter={handleCountryFilter}
            />
          ))}
        </div>
      </div>
    </animated.div>
  );
};

export default OrdersToProcessorsPage;