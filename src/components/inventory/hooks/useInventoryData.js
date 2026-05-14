import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import {
  selectInventorySkuList,
  selectInventoryOrdersMap,
  selectInventoryIsLoading,
  selectInventoryCurrentPage,
} from '../redux/inventorySlice';

import {
  selectInventoryDateRange,
  selectInventorySortingType,
  selectInventoryVcNameQuery,
  selectInventoryCategories,
  selectInventoryTagsMain,
  selectInventoryTagsCloth,
  selectInventoryTagsOthers,
  selectInventoryPatterns,
  selectInventoryOrderNames,
  selectInventoryGanttDeadline,
} from '../redux/inventoryFilterSlice';

import {
  sumTimeSeries,
  averageTimeSeries,
  filterSkuList,
  sortSkuList,
  paginateList,
  buildGanttWeeks,
  extractUniqueOrderNames,
  extractOrdersWithDates,
} from '../utils/inventoryHelpers';

/**
 * Центральный хук страницы инвентаря.
 * Собирает все данные из Redux, вычисляет производные значения и возвращает
 * готовые данные для рендера.
 */
export const useInventoryData = () => {
  // ── Raw data from Redux ──
  const rawSkuList = useSelector(selectInventorySkuList);
  const ordersMap = useSelector(selectInventoryOrdersMap);
  const isLoading = useSelector(selectInventoryIsLoading);
  const currentPage = useSelector(selectInventoryCurrentPage);

  // ── Filters ──
  const dateRange = useSelector(selectInventoryDateRange);
  const sortingType = useSelector(selectInventorySortingType);
  const vcNameQuery = useSelector(selectInventoryVcNameQuery);
  const categories = useSelector(selectInventoryCategories);
  const tagsMain = useSelector(selectInventoryTagsMain);
  const tagsCloth = useSelector(selectInventoryTagsCloth);
  const tagsOthers = useSelector(selectInventoryTagsOthers);
  const patterns = useSelector(selectInventoryPatterns);
  const orderNames = useSelector(selectInventoryOrderNames);
  const ganttDeadline = useSelector(selectInventoryGanttDeadline);

  const startDate = useMemo(() => new Date(dateRange.start), [dateRange.start]);
  const endDate = useMemo(() => new Date(dateRange.end), [dateRange.end]);

  // ── Augmented SKU list (computed metrics) ──
  const augmentedSkuList = useMemo(() => {
    return rawSkuList.map((sku) => ({
      ...sku,
      ordersSum: sumTimeSeries(sku.ordersTimeSeries, startDate, endDate),
      ebitdaAvg: averageTimeSeries(sku.ebitdaTimeSeries, startDate, endDate),
      ebitdaDailyAvg: averageTimeSeries(sku.ebitdaDailyTimeSeries, startDate, endDate),
    }));
  }, [rawSkuList, startDate, endDate]);

  // ── Filtered ──
  const filteredSkuList = useMemo(() => {
    return filterSkuList(augmentedSkuList, {
      vcNameQuery,
      categories,
      tagsMain,
      tagsCloth,
      tagsOthers,
      patterns,
      orderNames,
    });
  }, [augmentedSkuList, vcNameQuery, categories, tagsMain, tagsCloth, tagsOthers, patterns, orderNames]);

  // ── Sorted ──
  const sortedSkuList = useMemo(() => {
    return sortSkuList(filteredSkuList, sortingType);
  }, [filteredSkuList, sortingType]);

  // ── Paginated ──
  const { pages, totalPages, currentPageData } = useMemo(() => {
    return paginateList(sortedSkuList, currentPage);
  }, [sortedSkuList, currentPage]);

  // ── Gantt weeks & months ──
  const { weeks, months } = useMemo(() => {
    return buildGanttWeeks(ganttDeadline);
  }, [ganttDeadline]);

  // ── Meta for filters (unique values from raw data) ──
  const allCategories = useMemo(() => {
    return [...new Set(rawSkuList.map((s) => s.category))];
  }, [rawSkuList]);

  const allPatterns = useMemo(() => {
    return [...new Set(rawSkuList.map(s => s.pattern).filter(Boolean))].sort();
  }, [rawSkuList]);

  const allOrderNames = useMemo(() => {
    return [...new Set(rawSkuList.flatMap(s => s.ordersNames || []))].sort();
  }, [rawSkuList]);

  const allTagsMain = useMemo(() => {
    return [...new Set(rawSkuList.flatMap((s) => s.tagsMain))];
  }, [rawSkuList]);

  const allTagsCloth = useMemo(() => {
    return [...new Set(rawSkuList.flatMap((s) => s.tagsCloth))].sort();
  }, [rawSkuList]);

  const allTagsOthers = useMemo(() => {
    return [...new Set(rawSkuList.flatMap((s) => s.tagsOthers))];
  }, [rawSkuList]);

  const uniqueOrderNames = useMemo(() => {
    return extractUniqueOrderNames(ordersMap);
  }, [ordersMap]);

  const ordersWithDates = useMemo(() => {
    return extractOrdersWithDates(ordersMap);
  }, [ordersMap]);

  return {
    // Data
    allSkuList: augmentedSkuList,
    filteredSkuList: sortedSkuList,
    currentPageData: currentPageData ?? [],
    totalPages,
    currentPage,
    ordersMap,
    isLoading,

    // Gantt
    weeks,
    months,
    ganttDeadline,

    // Filters meta
    allCategories,
    allPatterns,
    allOrderNames,
    allTagsMain,
    allTagsCloth,
    allTagsOthers,
    uniqueOrderNames,
    ordersWithDates,

    // Date range (for charts)
    dateRange,
    startDate,
    endDate,
  };
};
