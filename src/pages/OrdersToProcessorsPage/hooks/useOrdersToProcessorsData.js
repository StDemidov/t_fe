import { useMemo } from 'react';
import {
  filterPredictList,
  sortPredictList,
  paginateList,
  buildGanttWeeks,
  getGanttDeadline,
} from '../../../widgets/orders-to-processors/lib/gantt';

const optionsOf = (values) =>
  values
    .map((value) => ({ value, label: String(value) }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, 'ru', { sensitivity: 'base' })
    );

const collectArray = (list, field) => [
  ...new Set(list.flatMap((item) => (item[field] || []).map(String))),
];

const collectField = (list, field) =>
  [...new Set(list.map((item) => String(item[field] || '')))].filter(Boolean);

const collectOrderNames = (list) => [
  ...new Set(
    list.flatMap((item) =>
      (item.sizes || []).flatMap((chart) =>
        (chart.orders || []).map((o) => String(o.name))
      )
    )
  ),
];

/**
 * Производные данные страницы заказов переработчикам:
 * фильтрация, сортировка, пагинация, недели Ганта и значения фильтров.
 */
export const useOrdersToProcessorsData = ({
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
}) => {
  const { weeks, months } = useMemo(
    () => buildGanttWeeks(getGanttDeadline()),
    []
  );

  const filteredSkuList = useMemo(
    () =>
      filterPredictList(items, {
        searchQuery,
        categories,
        tagsMain,
        tagsCloth,
        tagsOthers: tagsOther,
        patterns,
        countries,
        abcAll,
        abcCat,
        orderNames,
        onlyFilled,
        extraOrders,
      }),
    [items, searchQuery, categories, tagsMain, tagsCloth, tagsOther, patterns, countries, abcAll, abcCat, orderNames, onlyFilled, extraOrders]
  );

  const sortedSkuList = useMemo(
    () => sortPredictList(filteredSkuList, sortValue),
    [filteredSkuList, sortValue]
  );

  const { totalPages, currentPageData } = useMemo(
    () => paginateList(sortedSkuList, currentPage, pageSize),
    [sortedSkuList, currentPage, pageSize]
  );

  const optionCategories = useMemo(
    () => optionsOf(collectField(items, 'category')),
    [items]
  );
  const optionTagsMain = useMemo(
    () => optionsOf(collectArray(items, 'mainTags')),
    [items]
  );
  const optionTagsCloth = useMemo(
    () => optionsOf(collectArray(items, 'clothTags')),
    [items]
  );
  const optionTagsOther = useMemo(
    () => optionsOf(collectArray(items, 'otherTags')),
    [items]
  );
  const optionPatterns = useMemo(
    () => optionsOf(collectField(items, 'pattern')),
    [items]
  );
  const optionCountries = useMemo(
    () => optionsOf(collectField(items, 'country')),
    [items]
  );
  const optionAbcAll = useMemo(
    () => optionsOf(collectField(items, 'abcAmongAllCurrent')),
    [items]
  );
  const optionAbcCat = useMemo(
    () => optionsOf(collectField(items, 'abcAmongCategoryCurrent')),
    [items]
  );
  const optionOrderNames = useMemo(
    () => optionsOf(collectOrderNames(items)),
    [items]
  );

  return {
    filteredSkuList,
    currentPageData: currentPageData ?? [],
    totalPages,
    totalCount: sortedSkuList.length,
    weeks,
    months,

    // Опции для фильтров
    optionCategories,
    optionTagsMain,
    optionTagsCloth,
    optionTagsOther,
    optionPatterns,
    optionCountries,
    optionAbcAll,
    optionAbcCat,
    optionOrderNames,
  };
};