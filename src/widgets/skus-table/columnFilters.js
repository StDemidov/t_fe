/**
 * Конфигурация числовых фильтров колонок таблицы («как в Excel»).
 *
 * Для каждой колонки — список секций: value (ключ в модели фильтра), label
 * (подпись в выпадающем списке) и get(item) — значение, по которому фильтруем
 * (то же число, что показывает колонка). Одна секция = без выбора секции.
 */
import { sumDaily, lastDaily } from './columns';

const num = (v) => Number(v) || 0;

/** «В пути»: сумма «к клиенту» + «на склад». */
const onWayTotal = (item) =>
  num(item.quantityOnWayToClientCurrent) +
  num(item.quantityOnWayToWarehouseCurrent);

/** Оборачиваемость «по заказам»: поле может быть скаляром или {дата: значение}. */
const turnoverByOrders = (item, key) => {
  const raw = item[key];
  return raw && typeof raw === 'object' && !Array.isArray(raw)
    ? num(lastDaily(raw))
    : num(raw);
};

/** Оборачиваемость «по выкупам»: по заказам / медианный выкуп; null при нулевой медиане. */
const turnoverByBuyout = (item, key) => {
  const medianBuyout = num(item.medianBuyout);
  return medianBuyout !== 0 ? turnoverByOrders(item, key) / medianBuyout : null;
};

const turnoverSections = (key) => [
  { value: 'orders', label: 'По заказам', get: (it) => turnoverByOrders(it, key) },
  { value: 'buyout', label: 'По выкупам', get: (it) => turnoverByBuyout(it, key) },
];

/** Единственная секция (колонка без выбора секции). */
const single = (get) => [{ value: 'value', label: '', get }];

/** Число или null, если значение не валидно (для ROI/выкупа, где бывает null). */
const finiteOrNull = (v) => {
  const n = Number(v);
  return v === null || v === undefined || !Number.isFinite(n) ? null : n;
};

export const COLUMN_FILTERS = {
  selfprice: [
    { value: 'withNds', label: 'С НДС', get: (it) => num(it.selfpriceWithNds) },
    {
      value: 'withoutNds',
      label: 'Без НДС',
      get: (it) => num(it.selfpriceWithoutNds),
    },
  ],
  priceBeforeSpp: [
    { value: 'price', label: 'Цена', get: (it) => lastDaily(it.price) },
    { value: 'spp', label: 'Размер СПП', get: (it) => num(it.sppAmount) },
  ],
  orders: [
    { value: 'fbs', label: 'FBS', get: (it) => num(it.ordersSumFbs) },
    { value: 'fbw', label: 'FBW', get: (it) => num(it.ordersSumFbw) },
    { value: 'total', label: 'Сумма', get: (it) => num(it.ordersSum) },
  ],
  sales: [
    { value: 'fbs', label: 'FBS', get: (it) => num(it.salesSumFbs) },
    { value: 'fbw', label: 'FBW', get: (it) => num(it.salesSumFbw) },
    { value: 'total', label: 'Сумма', get: (it) => num(it.salesSum) },
  ],
  stocks: [
    { value: 'fbs', label: 'FBS', get: (it) => num(it.stocksLastFbs) },
    { value: 'fbw', label: 'FBW', get: (it) => num(it.stocksLastFbw) },
    { value: 'total', label: 'Сумма', get: (it) => num(it.stocksLast) },
  ],
  stocksLast: [
    { value: 'fbs', label: 'FBS', get: (it) => num(it.stocksFbsCurrent) },
    { value: 'fbw', label: 'FBW', get: (it) => num(it.stocksFbwCurrent) },
    { value: 'way', label: 'В пути', get: onWayTotal },
    {
      value: 'total',
      label: 'Всего',
      get: (it) =>
        num(it.stocksFbsCurrent) + num(it.stocksFbwCurrent) + onWayTotal(it),
    },
  ],
  ordersToProcessors: single((it) => num(it.ordersToProcessors)),
  turnoverFbs: turnoverSections('turnoverFbs'),
  turnoverFbw: turnoverSections('turnoverFbw'),
  turnoverTotal: turnoverSections('turnoverTotal'),
  ebitda: single((it) => lastDaily(it.ebitda)),
  ebitdaDay: [
    { value: 'fbs', label: 'FBS', get: (it) => sumDaily(it.totalEbitdaFbs) },
    { value: 'fbw', label: 'FBW', get: (it) => sumDaily(it.totalEbitdaFbw) },
    {
      value: 'total',
      label: 'Сумма',
      get: (it) => sumDaily(it.totalEbitdaFbs) + sumDaily(it.totalEbitdaFbw),
    },
  ],
  ebitdaNoAds: single((it) => num(it.ebitdaNoAdsSum)),
  ads: single((it) => sumDaily(it.adsCosts)),
  crToCart: single((it) => num(it.totalCrToCart)),
  crCartToOrder: single((it) => num(it.totalCartToOrder)),
  crClickToOrder: single((it) => num(it.totalClickToOrder)),
  cpo: single((it) => num(it.avgCpo)),
  cps: single((it) => num(it.avgCps)),
  // ROI хранится в долях — фильтруем по отображаемому проценту (×100).
  roi: single((it) => {
    const v = finiteOrNull(it.roi);
    return v === null ? null : v * 100;
  }),
  // Процент выкупа хранится в долях — фильтруем по отображаемому проценту.
  buyout: single((it) => {
    const v = finiteOrNull(it.medianBuyoutPercent);
    return v === null ? null : v * 100;
  }),
};

/** Фильтр активен, когда заполнено значение (для «Между» — оба). */
export const isColumnFilterActive = (filter) =>
  !!filter &&
  filter.value !== '' &&
  (filter.op !== 'between' || filter.valueTo !== '');

const matchValue = (num, filter) => {
  const v = Number(filter.value);
  switch (filter.op) {
    case 'eq':
      return num === v;
    case 'neq':
      return num !== v;
    case 'gt':
      return num > v;
    case 'gte':
      return num >= v;
    case 'lt':
      return num < v;
    case 'lte':
      return num <= v;
    case 'between': {
      const a = Math.min(v, Number(filter.valueTo));
      const b = Math.max(v, Number(filter.valueTo));
      return num >= a && num <= b;
    }
    default:
      return true;
  }
};

/** Проходит ли артикул один фильтр колонки. Невалидное значение (null)
 *  при активном фильтре строку отсекает. */
export const matchesColumnFilter = (item, filter, sections) => {
  if (!isColumnFilterActive(filter) || !sections) return true;
  const section =
    sections.find((s) => s.value === filter.section) || sections[0];
  const v = section.get(item);
  if (!Number.isFinite(Number(v)) || v === null || v === undefined) return false;
  return matchValue(Number(v), filter);
};

/** Проходит ли артикул все активные фильтры колонок (по И). */
export const matchesAllColumnFilters = (item, filters) =>
  Object.entries(filters || {}).every(([columnId, filter]) =>
    matchesColumnFilter(item, filter, COLUMN_FILTERS[columnId])
  );
