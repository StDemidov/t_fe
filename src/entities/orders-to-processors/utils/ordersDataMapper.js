// Порядок размеров — сортировка chartId внутри артикула.
const SIZE_ORDER = [
  'XXS-XS', 'S-M', 'L-XL',
  'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '4XL',
  'XS/155', 'S/155', 'M/155', 'L/155', 'XL/155', 'XXL/155',
  'XS/175', 'S/175', 'M/175', 'L/175', 'XL/175', 'XXL/175',
  'XS РОСТ 1', 'S РОСТ 1', 'M РОСТ 1', 'L РОСТ 1', 'XL РОСТ 1', 'XXL РОСТ 1',
  'XS РОСТ 2', 'S РОСТ 2', 'M РОСТ 2', 'L РОСТ 2', 'XL РОСТ 2', 'XXL РОСТ 2',
];

const sortBySize = (a, b) => {
  const ai = SIZE_ORDER.indexOf(String(a.size || '').toUpperCase());
  const bi = SIZE_ORDER.indexOf(String(b.size || '').toUpperCase());
  return (ai < 0 ? SIZE_ORDER.length : ai) - (bi < 0 ? SIZE_ORDER.length : bi);
};

/**
 * Нормализация словаря заказов переработчику.
 * @param {Record<string, {plannedCompletionDate: string, quantity: number}>} raw
 * @returns {Array<{ name, plannedCompletionDate, quantity }>} отсортировано по дате
 */
const normalizeOrdersToProcessors = (raw = {}) =>
  Object.entries(raw)
    .map(([name, o]) => ({
      name,
      plannedCompletionDate: o?.plannedCompletionDate || null,
      quantity: Number(o?.quantity) || 0,
    }))
    .sort((a, b) => new Date(a.plannedCompletionDate) - new Date(b.plannedCompletionDate));

/**
 * Нормализация chartIds артикула.
 * @param {Record<string, {size, predict, stocksTotal, turnoverTotal, ordersToProcessors}>} raw
 * @returns {Array<{ chartId, size, predict, stocksTotal, turnoverTotal, orders }>}
 */
const normalizeChartIds = (raw = {}) =>
  Object.entries(raw)
    .map(([chartId, c]) => ({
      chartId,
      size: c?.size || '',
      predict: Array.isArray(c?.predict) ? c.predict.map(Number) : [],
      stocksTotal: Number(c?.stocksTotal) || 0,
      turnoverTotal: Number(c?.turnoverTotal) || 0,
      orders: normalizeOrdersToProcessors(c?.ordersToProcessors),
    }))
    .sort(sortBySize);

/**
 * Трансформация одного артикула из API `get_predicts`.
 * Поля приходят уже готовыми к отображению — нормализуем только
 * вложенные структуры (chartIds, ordersToProcessors).
 */
export const mapPredictItem = (raw) => ({
  id: raw.sku,
  sku: raw.sku,
  vendorCode: raw.vendorCode,
  startOfRealizationDate: raw.startOfRealizationDate || null,
  category: raw.category || '',
  pattern: raw.pattern || '',
  image: raw.image || '',
  country: raw.country || '',

  // Словари по датам за запрошенный диапазон
  ordersTotal: raw.ordersTotal || {},
  price: raw.price || {},
  cpo: raw.cpo || {},

  ordersTotalSum: Number(raw.ordersTotalSum) || 0,
  totalEbitdaAvg: Math.round(Number(raw.totalEbitdaAvg) || 0),
  ebitdaAvg: Math.round(Number(raw.ebitdaAvg) || 0),
  buyoutPercentMedian: raw.buyoutPercentMedian != null
    ? Math.round(raw.buyoutPercentMedian)
    : null,
  selfpriceWithNds: Number(raw.selfpriceWithNds) || 0,
  selfpriceWithoutNds: Number(raw.selfpriceWithoutNds) || 0,
  roi: raw.roi != null ? Math.round(raw.roi) : null,

  abcAmongAllCurrent: raw.abcAmongAllCurrent || '',
  abcAmongCategoryCurrent: raw.abcAmongCategoryCurrent || '',

  mainTags: Array.isArray(raw.mainTags) ? raw.mainTags : [],
  clothTags: Array.isArray(raw.clothTags) ? raw.clothTags : [],
  otherTags: Array.isArray(raw.otherTags) ? raw.otherTags : [],

  // Размеры (chartId) — ключ при расчёте Ганта и заказов
  sizes: normalizeChartIds(raw.chartIds),
});