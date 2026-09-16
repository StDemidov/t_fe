/**
 * Колонки таблицы Категорий.
 *
 * Заполнены данными «Категория», «Кол-во артикулов», а также колонки-графики
 * (Заказы, Продажи, Остатки, Остатки последние, EBITDA/день). Прочие колонки
 * зарезервированы под будущие метрики и рендерят заглушку «—».
 */

/** ID закреплённой слева колонки (перемещать/скрывать нельзя). */
export const FIXED_COLUMN_ID = 'category';

export const CATEGORY_COLUMNS = [
  { id: 'category', label: 'Категория', key: 'category', width: 260 },
  { id: 'skusCount', label: 'Кол-во артикулов', key: 'skus_count', width: 170 },
  { id: 'orders', label: 'Заказы', key: 'orders', width: 200 },
  { id: 'sales', label: 'Продажи', key: 'sales', width: 200 },
  { id: 'stocks', label: 'Остатки', key: 'stocks', width: 200 },
  { id: 'stocksLast', label: 'Остатки последние', key: 'stocksLast', width: 200 },
  { id: 'ebitdaDay', label: 'EBITDA/день', key: 'ebitdaDay', width: 200 },
  { id: 'ebitdaNoAds', label: 'EBITDA/день без РК', key: 'ebitdaNoAds', width: 200 },
  { id: 'ads', label: 'Рекламные расходы', key: 'ads', width: 200 },
  { id: 'cpoClean', label: 'CPO чистый', key: 'cpoClean', width: 200 },
  { id: 'cpsClean', label: 'CPS чистый', key: 'cpsClean', width: 200 },
  { id: 'cpoSpread', label: 'CPO размазанный', key: 'cpoSpread', width: 200 },
  { id: 'cpsSpread', label: 'CPS размазанный', key: 'cpsSpread', width: 200 },
  { id: 'ebitdaAvg', label: 'Средняя EBITDA', key: 'ebitdaAvg', width: 200 },
  { id: 'ebitdaByOrders', label: 'EBITDA по заказам', key: 'ebitdaByOrders', width: 200 },
  { id: 'avgPrice', label: 'Средняя цена', key: 'avgPrice', width: 200 },
  { id: 'avgBuyout', label: 'Средний % выкупа', key: 'avgBuyout', width: 200 },
  { id: 'crClickToCart', label: 'CR (клик в корзину)', key: 'crClickToCart', width: 200 },
  { id: 'crCartToOrder', label: 'CR (корзина в заказ)', key: 'crCartToOrder', width: 200 },
  { id: 'crClickToOrder', label: 'CR (клик в заказ)', key: 'crClickToOrder', width: 200 },
  { id: 'avgSelfprice', label: 'Средняя себестоимость', key: 'avgSelfprice', width: 220 },
];

/** Возвращает видимые колонки (без скрытых по умолчанию). */
export const getVisibleColumns = () =>
  CATEGORY_COLUMNS.filter((column) => !column.hidden);

/** Сумма всех значений объекта {дата: значение}. */
export const sumDaily = (daily) =>
  daily
    ? Object.values(daily).reduce((sum, value) => sum + (Number(value) || 0), 0)
    : 0;

/** Последнее не null/пустое значение словаря {дата: значение}; иначе 0. */
export const lastDaily = (daily) => {
  if (!daily) return 0;
  const dates = Object.keys(daily).sort();
  for (let i = dates.length - 1; i >= 0; i--) {
    const raw = daily[dates[i]];
    if (raw === null || raw === undefined || raw === '') continue;
    return Number(raw) || 0;
  }
  return 0;
};

/** Сумма двух датасетов по датам: { дата: a + b } по всему пересечению дат. */
export const sumDailyMap = (a, b) => {
  const aMap = a || {};
  const bMap = b || {};
  const dates = new Set([...Object.keys(aMap), ...Object.keys(bMap)]);
  const result = {};
  for (const date of dates) {
    result[date] = (Number(aMap[date]) || 0) + (Number(bMap[date]) || 0);
  }
  return result;
};

/**
 * Доля двух датасетов по датам в процентах: (числитель / знаменатель) * 100.
 * Дни с нулевым/отсутствующим знаменателем отдаются как null.
 */
export const divideDailyPercent = (numerator, denominator) => {
  const numMap = numerator || {};
  const denMap = denominator || {};
  const result = {};
  for (const [date, value] of Object.entries(numMap)) {
    const d = denMap[date];
    if (d === null || d === undefined || d === '' || Number(d) === 0) {
      result[date] = null;
    } else {
      result[date] = ((Number(value) || 0) / Number(d)) * 100;
    }
  }
  return result;
};

/** Доля двух сумм в процентах: (числитель / знаменатель) * 100, либо «—». */
export const percentRatio = (numerator, denominator) => {
  const d = Number(denominator);
  if (denominator === null || denominator === undefined || denominator === '' || !d) {
    return '—';
  }
  return `${(((Number(numerator) || 0) / d) * 100).toFixed(2)} %`;
};