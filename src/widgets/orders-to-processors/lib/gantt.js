import { format, startOfWeek, addWeeks, endOfWeek, isBefore } from 'date-fns';
import { ru } from 'date-fns/locale';

// ─── Месяцы именительного падежа (ru date-fns даёт родительный) ─────────────

const MONTHS_NOMINATIVE = {
  января: 'Январь',
  февраля: 'Февраль',
  марта: 'Март',
  апреля: 'Апрель',
  мая: 'Май',
  июня: 'Июнь',
  июля: 'Июль',
  августа: 'Август',
  сентября: 'Сентябрь',
  октября: 'Октябрь',
  ноября: 'Ноябрь',
  декабря: 'Декабрь',
};

const toNominative = (genitiveName) =>
  MONTHS_NOMINATIVE[genitiveName.toLowerCase()] || genitiveName;

/** Дата дедлайна (горизонт Ганта): длина списка предиктов — всегда 53 недели. */
export const getGanttDeadline = () => {
  const from = startOfWeek(new Date(), { weekStartsOn: 1 });
  return addWeeks(from, 53).toISOString().split('T')[0];
};

/**
 * Строит недели Ганта от текущей недели (пн) до дедлайна.
 * predict[i] внутри chartId соответствует i-й неделе от текущей.
 */
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
    const monthGenitive = format(cursor, 'LLLL', { locale: ru });
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

// ─── Статусы ячеек Ганта ─────────────────────────────────────────────────────

export const CELL_STATUS = {
  GREEN: 'green',
  YELLOW: 'yellow',
  RED: 'red',
  GRAY: 'gray',
  BLUE: 'blue',
  PURPLE: 'purple',
};

// ─── Расчёт ячеек Ганта ──────────────────────────────────────────────────────
// Логика перенесена из старого SkuGanttRow.buildCells: потребность (predict)
// закрывается остатком (stocksTotal), затем заказами переработчикам
// (plannedCompletionDate <= конца недели), затем ручным вводом (extraOrders).

/**
 * @param {{ chartId, size, predict, stocksTotal, turnoverTotal, orders }} chart
 * @param {Array} weeks — недели Ганта
 * @param {Record<string, number>} extraOrders — ручные заказы по chartId
 * @param {string|null} startCalcDate — дата начала расчёта (YYYY-MM-DD)
 */
export const buildCells = (chart, weeks, extraOrders, startCalcDate) => {
  const chartOrders = chart.orders || [];
  const dateFrom = startCalcDate ? new Date(startCalcDate) : null;
  let stock = chart.stocksTotal;
  let extra = extraOrders[chart.chartId] || 0;
  let oi = 0;
  let stockUsed = false;
  let extraUsed = false;
  let prevOrderName = null;
  let prevOrderAmount = null;

  return weeks.map((week, i) => {
    const forecast = chart.predict[i] || 0;
    let pushed = false;
    let newlyAdded = [];
    let names = [];

    if (oi < chartOrders.length && chartOrders[oi].plannedCompletionDate) {
      const due = new Date(chartOrders[oi].plannedCompletionDate) <= week.endDate;
      if (due) {
        while (oi < chartOrders.length && stock < forecast) {
          const o = chartOrders[oi];
          if (o.quantity > 0) {
            names.push(o.name);
            newlyAdded.push({ name: o.name, amount: o.quantity });
            prevOrderName = o.name;
            prevOrderAmount = o.quantity;
            stock += o.quantity;
            stockUsed = true;
            pushed = true;
          }
          oi++;
        }
      }
    }

    let status =
      names.length > 0
        ? CELL_STATUS.PURPLE
        : stock >= forecast
        ? CELL_STATUS.GREEN
        : stock > 0
        ? CELL_STATUS.YELLOW
        : CELL_STATUS.RED;

    const waitFuture =
      stock < forecast &&
      oi < chartOrders.length &&
      chartOrders[oi].plannedCompletionDate &&
      new Date(chartOrders[oi].plannedCompletionDate) > week.endDate;
    const waitStart =
      dateFrom &&
      stock <= 0 &&
      stock < forecast &&
      oi >= chartOrders.length &&
      week.endDate < dateFrom;

    if (waitFuture || waitStart) {
      stock = 0;
      status = CELL_STATUS.GRAY;
    } else {
      if (stock < forecast && extra > 0 && (!dateFrom || week.endDate >= dateFrom)) {
        const add = Math.min(extra, forecast - stock);
        extraUsed = true;
        stock += add;
        extra -= add;
        status = CELL_STATUS.BLUE;
      }
      if (stockUsed && !pushed && stock >= forecast && !extraUsed) {
        names.push(prevOrderName);
        status = CELL_STATUS.PURPLE;
      }
      stock -= forecast;
    }

    if (status === CELL_STATUS.YELLOW && dateFrom) {
      if (dateFrom > week.endDate) {
        stock = 0;
        status = CELL_STATUS.GRAY;
      } else status = CELL_STATUS.RED;
    }

    const tooltipOrders =
      status === CELL_STATUS.PURPLE
        ? newlyAdded.length > 0
          ? newlyAdded
          : [{ name: prevOrderName, amount: prevOrderAmount }]
        : [];

    return { status, names, stock, forecast, tooltipOrders };
  });
};

// ─── Фильтрация ──────────────────────────────────────────────────────────────

const includesAny = (haystack, needles) =>
  needles.some((n) => haystack.includes(n));

export const filterPredictList = (list, filters) => {
  const {
    searchQuery,
    categories,
    tagsMain,
    tagsCloth,
    tagsOthers,
    patterns,
    countries,
    abcAll,
    abcCat,
    orderNames = [],
    onlyFilled = false,
    extraOrders = {},
  } = filters;
  return list.filter((item) => {
    if (searchQuery.length > 0) {
      const isNumeric = !isNaN(searchQuery);
      const matches = isNumeric
        ? String(item.sku).includes(searchQuery)
        : item.vendorCode.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matches) return false;
    }
    if (categories.length > 0 && !categories.includes(item.category)) return false;
    if (tagsMain.length > 0 && !includesAny(item.mainTags, tagsMain)) return false;
    if (tagsCloth.length > 0 && !includesAny(item.clothTags, tagsCloth)) return false;
    if (tagsOthers.length > 0 && !includesAny(item.otherTags, tagsOthers)) return false;
    if (patterns?.length > 0 && !patterns.includes(item.pattern)) return false;
    if (countries?.length > 0 && !countries.includes(item.country)) return false;
    if (abcAll?.length > 0 && !abcAll.includes(item.abcAmongAllCurrent)) return false;
    if (abcCat?.length > 0 && !abcCat.includes(item.abcAmongCategoryCurrent)) return false;
    // По именам заказов переработчикам (ordersToProcessors -> name)
    if (orderNames.length > 0) {
      const hasOrder = (item.sizes || []).some((chart) =>
        (chart.orders || []).some((o) => orderNames.includes(String(o.name)))
      );
      if (!hasOrder) return false;
    }
    // Только артикулы с введённым размером заказа в инпут
    if (onlyFilled) {
      const hasFilled = (item.sizes || []).some(
        (chart) => (extraOrders[chart.chartId] || 0) > 0
      );
      if (!hasFilled) return false;
    }
    return true;
  });
};

// ─── Сортировка ──────────────────────────────────────────────────────────────

export const SORTING_OPTIONS = [
  { value: 'ordersTotalSum:desc', label: 'Заказы' },
  { value: 'ordersTotalSum:asc', label: 'Заказы' },
  { value: 'totalEbitdaAvg:desc', label: 'EBITDA/день' },
  { value: 'totalEbitdaAvg:asc', label: 'EBITDA/день' },
  { value: 'ebitdaAvg:desc', label: 'EBITDA' },
  { value: 'ebitdaAvg:asc', label: 'EBITDA' },
  { value: 'roi:desc', label: 'ROI' },
  { value: 'roi:asc', label: 'ROI' },
  { value: 'startOfRealizationDate:desc', label: 'От новых к старым' },
  { value: 'startOfRealizationDate:asc', label: 'От старых к новым' },
];

export const sortPredictList = (list, sortValue) => {
  const sorted = [...list];
  if (!sortValue) return sorted.sort((a, b) => b.ordersTotalSum - a.ordersTotalSum);
  const [field, dir] = sortValue.split(':');
  const mul = dir === 'desc' ? -1 : 1;
  if (field === 'startOfRealizationDate') {
    return sorted.sort((a, b) => {
      const va = String(a[field] || '');
      const vb = String(b[field] || '');
      if (va === vb) return 0;
      if (!va) return 1;
      if (!vb) return -1;
      return (va < vb ? -1 : 1) * mul;
    });
  }
  return sorted.sort(
    (a, b) => ((Number(a[field]) || 0) - (Number(b[field]) || 0)) * mul
  );
};

// ─── Пагинация ───────────────────────────────────────────────────────────────

export const PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [25, 50, 100];

export const paginateList = (list, page, pageSize = PAGE_SIZE) => {
  const pages = [];
  for (let i = 0; i < list.length; i += pageSize)
    pages.push(list.slice(i, i + pageSize));
  if (pages.length === 0)
    return { pages: [[]], totalPages: 1, currentPageData: [] };
  const safePage = Math.min(Math.max(page, 1), pages.length);
  return {
    pages,
    totalPages: pages.length,
    currentPageData: pages[safePage - 1],
  };
};

// ─── Валидация даты ──────────────────────────────────────────────────────────

export const isValidDateFormat = (value) =>
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value);