import {
  format,
  startOfWeek,
  addWeeks,
  endOfWeek,
  isBefore,
} from 'date-fns';
import { ru } from 'date-fns/locale';

// ─── Date range slicing ──────────────────────────────────────────────────────

export const sliceTimeSeriesForRange = (series, startDate, endDate) => {
  const today = new Date();
  const startIndex = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
  const endIndex = Math.floor((today - endDate) / (1000 * 60 * 60 * 24));
  if (startIndex < 0 || endIndex >= series.length || startIndex < endIndex) return [];
  return endIndex === 1
    ? series.slice(-startIndex + 1)
    : series.slice(-startIndex + 1, -endIndex + 1);
};

export const sumTimeSeries = (series, startDate, endDate) => {
  const sliced = sliceTimeSeriesForRange(series, startDate, endDate);
  return sliced.reduce((acc, n) => acc + n, 0);
};

export const averageTimeSeries = (series, startDate, endDate) => {
  const sliced = sliceTimeSeriesForRange(series, startDate, endDate);
  if (!sliced.length) return 0;
  return Math.round(sliced.reduce((acc, n) => acc + n, 0) / sliced.length);
};

export const calcCostPerOrder = (ordersTimeSeries, adsCostsTimeSeries) => {
  const len = Math.min(ordersTimeSeries.length, adsCostsTimeSeries.length);
  const result = [];
  for (let i = 0; i < len; i++) {
    result.push(ordersTimeSeries[i] > 0 ? Math.round(adsCostsTimeSeries[i] / ordersTimeSeries[i]) : 0);
  }
  return result;
};

// ─── Gantt weeks ─────────────────────────────────────────────────────────────

// Месяцы в именительном падеже (ru date-fns даёт родительный)
const MONTHS_NOMINATIVE = {
  'января': 'Январь', 'февраля': 'Февраль', 'марта': 'Март',
  'апреля': 'Апрель', 'мая': 'Май', 'июня': 'Июнь',
  'июля': 'Июль', 'августа': 'Август', 'сентября': 'Сентябрь',
  'октября': 'Октябрь', 'ноября': 'Ноябрь', 'декабря': 'Декабрь',
};

const toNominative = (genitiveName) =>
  MONTHS_NOMINATIVE[genitiveName.toLowerCase()] || genitiveName;

export const buildGanttWeeks = (deadlineDate) => {
  const today = new Date();
  let cursor = startOfWeek(today, { weekStartsOn: 1 });
  const end = new Date(deadlineDate);
  const weeks = [];
  const months = [];
  let currentMonth = null;
  let monthStartIndex = 0;

  while (isBefore(cursor, end)) {
    const weekEnd = endOfWeek(cursor, { weekStartsOn: 1 });
    const monthGenitive = format(cursor, 'LLLL', { locale: ru }); // LLLL = standalone form
    const monthName = toNominative(monthGenitive);

    if (monthName !== currentMonth) {
      if (currentMonth !== null) {
        months.push({ name: currentMonth, span: weeks.length - monthStartIndex });
      }
      currentMonth = monthName;
      monthStartIndex = weeks.length;
    }

    weeks.push({
      start: format(cursor, 'dd'),
      end: format(weekEnd, 'dd'),
      startDate: new Date(cursor),
      endDate: new Date(weekEnd),
    });
    cursor = addWeeks(cursor, 1);
  }

  if (currentMonth !== null) {
    months.push({ name: currentMonth, span: weeks.length - monthStartIndex });
  }

  return { weeks, months };
};

// ─── Filtering ───────────────────────────────────────────────────────────────

const includesAny = (haystack, needles) => needles.some((n) => haystack.includes(n));

export const filterSkuList = (skuList, filters) => {
  const { vcNameQuery, categories, tagsMain, tagsCloth, tagsOthers, patterns, orderNames } = filters;
  return skuList.filter((sku) => {
    if (vcNameQuery.length > 0) {
      const isNumeric = !isNaN(vcNameQuery);
      const matches = isNumeric
        ? sku.sku.toLowerCase().includes(vcNameQuery)
        : sku.vcName.toLowerCase().includes(vcNameQuery.toLowerCase());
      if (!matches) return false;
    }
    if (categories.length > 0 && !categories.includes(sku.category)) return false;
    if (tagsMain.length > 0 && !includesAny(sku.tagsMain, tagsMain)) return false;
    if (tagsCloth.length > 0 && !includesAny(sku.tagsCloth, tagsCloth)) return false;
    if (tagsOthers.length > 0 && !includesAny(sku.tagsOthers, tagsOthers)) return false;
    // Новые фильтры
    if (patterns?.length > 0 && !patterns.includes(sku.pattern)) return false;
    if (orderNames?.length > 0 && !(sku.ordersNames ?? []).some(n => orderNames.includes(n))) return false;
    return true;
  });
};

// ─── Sorting ─────────────────────────────────────────────────────────────────

export const SORTING_OPTIONS = [
  'EBITDA (сред) ↓', 'EBITDA (сред) ↑',
  'EBITDA/день (сред) ↓', 'EBITDA/день (сред) ↑',
  'Заказы ↓', 'Заказы ↑',
  'От новых к старым', 'От старых к новым',
];

export const sortSkuList = (list, sortingType) => {
  const sorted = [...list];
  switch (sortingType) {
    case 'EBITDA (сред) ↓': return sorted.sort((a, b) => b.ebitdaAvg - a.ebitdaAvg);
    case 'EBITDA (сред) ↑': return sorted.sort((a, b) => a.ebitdaAvg - b.ebitdaAvg);
    case 'EBITDA/день (сред) ↓': return sorted.sort((a, b) => b.ebitdaDailyAvg - a.ebitdaDailyAvg);
    case 'EBITDA/день (сред) ↑': return sorted.sort((a, b) => a.ebitdaDailyAvg - b.ebitdaDailyAvg);
    case 'Заказы ↓': return sorted.sort((a, b) => b.ordersSum - a.ordersSum);
    case 'Заказы ↑': return sorted.sort((a, b) => a.ordersSum - b.ordersSum);
    case 'От новых к старым': return sorted.sort((a, b) => b.startDate - a.startDate);
    case 'От старых к новым': return sorted.sort((a, b) => a.startDate - b.startDate);
    default: return sorted.sort((a, b) => b.ebitdaAvg - a.ebitdaAvg);
  }
};

// ─── Pagination ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

export const paginateList = (list, page) => {
  const pages = [];
  for (let i = 0; i < list.length; i += PAGE_SIZE) pages.push(list.slice(i, i + PAGE_SIZE));
  if (pages.length === 0) return { pages: [[]], totalPages: 1, currentPageData: [] };
  const safePage = Math.min(Math.max(page, 1), pages.length);
  return { pages, totalPages: pages.length, currentPageData: pages[safePage - 1] };
};

// ─── Gantt cell statuses ──────────────────────────────────────────────────────

export const CELL_STATUS = {
  GREEN: 'green', YELLOW: 'yellow', RED: 'red',
  GRAY: 'gray', BLUE: 'blue', PURPLE: 'purple',
};

// ─── XLS ─────────────────────────────────────────────────────────────────────

export const extractUniqueOrderNames = (ordersMap) => {
  const names = new Set();
  Object.values(ordersMap).forEach((orders) => orders.forEach((o) => names.add(o.name)));
  return Array.from(names);
};

/** Returns [{name, date}] with the latest date per order name */
export const extractOrdersWithDates = (ordersMap) => {
  const map = {}; // name -> latest date
  Object.values(ordersMap).forEach((orders) => {
    orders.forEach((o) => {
      if (!map[o.name] || o.date > map[o.name]) map[o.name] = o.date;
    });
  });
  return Object.entries(map).map(([name, date]) => ({ name, date }));
};

// ─── Date validation ──────────────────────────────────────────────────────────

export const isValidDateFormat = (value) =>
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value);
