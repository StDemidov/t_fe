import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSkusMetrics as fetchSkusMetricsApi } from '../api';
import { setError } from '../../../redux/slices/errorSlice';

/** Ключ диапазона дат для кэша. */
const rangeKey = ({ startDate, endDate }) => `${startDate}::${endDate}`;

// Кэш по диапазону: готовые (уже обогащённые) элементы для мгновенного
// отображения при повторном заходе на страницу с тем же диапазоном.
const cache = new Map();

/**
 * Обогащает элементы порциями, отдавая управление браузеру между порциями,
 * чтобы большой объём данных не блокировал интерфейс.
 */
const enrichChunked = async (payload, enrich) => {
  const out = new Array(payload.length);
  const CHUNK = 200;
  let i = 0;
  while (i < payload.length) {
    const end = Math.min(i + CHUNK, payload.length);
    for (let j = i; j < end; j += 1) out[j] = enrich(payload[j]);
    i = end;
    // Позволяем браузеру обработать события между порциями.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return out;
};

export const fetchSkusMetrics = createAsyncThunk(
  'skusMetrics/fetch',
  async (range, thunkAPI) => {
    // Тот же диапазон уже получен — возвращаем из кэша мгновенно.
    const key = rangeKey(range);
    if (cache.has(key)) {
      return { fromCache: true, items: cache.get(key), key };
    }
    try {
      const payload = await fetchSkusMetricsApi(range);
      // Обогащаем не на основном потоке единым блоком, а порциями, чтобы
      // интерфейс не «замирал» во время обработки большого ответа.
      const items = await enrichChunked(payload, enrichItem);
      cache.set(key, items);
      // Храним только последний диапазон — избегаем утечки памяти.
      if (cache.size > 1) {
        const oldest = cache.keys().next().value;
        if (oldest !== key) cache.delete(oldest);
      }
      return { fromCache: false, items, key };
    } catch (error) {
      thunkAPI.dispatch(setError(error.message || 'Не удалось загрузить метрики SKU'));
      throw error;
    }
  }
);

/** Сумма всех значений объекта {дата: число}. */
const sumDaily = (daily) =>
  daily
    ? Object.values(daily).reduce((sum, v) => sum + (Number(v) || 0), 0)
    : 0;

/** Среднее значение по дням (сумма / кол-во дней). */
const avgDaily = (daily) => {
  if (!daily) return 0;
  const vals = Object.values(daily);
  if (vals.length === 0) return 0;
  return vals.reduce((sum, v) => sum + (Number(v) || 0), 0) / vals.length;
};

/** Последнее не-null значение по дате (даты сортируются); null/пусто пропускаются. */
const lastDaily = (daily) => {
  if (!daily) return 0;
  const dates = Object.keys(daily).sort();
  for (let i = dates.length - 1; i >= 0; i--) {
    const raw = daily[dates[i]];
    if (raw === null || raw === undefined || raw === '') continue;
    return Number(raw) || 0;
  }
  return 0;
};

/** Медианное значение по дням объекта {дата: число}; null-значения пропускаются. */
const medianDaily = (daily) => {
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

/** Процент по каждой дате: numerator / denominator * 100, с защитой от /0,
 *  результат округляется до 2 знаков после запятой. */
const ratioDaily = (numerator, denominator) => {
  const num = numerator || {};
  const den = denominator || {};
  const out = {};
  for (const date of Object.keys(num)) {
    const d = Number(den[date]) || 0;
    out[date] =
      d !== 0
        ? Math.round(((Number(num[date]) || 0) / d) * 100 * 100) / 100
        : 0;
  }
  return out;
};

/** Поле в данных артикула по типу тега. */
const TAG_FIELD_BY_TYPE = {
  main: 'mainTags',
  cloth: 'clothTags',
  others: 'otherTags',
};

/** ROI: (avgEbitda − avgCps) / selfpriceWithoutNds, в долях; null при
 *  некорректных или нулевых входных данных. */
const computeRoi = (avgEbitda, avgCps, selfprice) => {
  const cost = Number(selfprice);
  if (
    !Number.isFinite(Number(avgEbitda)) ||
    !Number.isFinite(Number(avgCps)) ||
    !Number.isFinite(cost) ||
    cost === 0
  ) {
    return null;
  }
  return (Number(avgEbitda) - Number(avgCps)) / cost;
};

/**
 * Добавляет к артикулу предвычисленные суммы для сортировки:
 * ordersSumFbs/Fbw/Sum, salesSumFbs/Fbw/Sum, ebitdaDayFbs/Fbw/Day,
 * stocksLastFbs/Fbw/Last, adsCostsSum. А также percentные метрики конверсий:
 * crToCart/crCartToOrder/crClickToOrder (по датам) и их тоталы.
 */
const enrichItem = (item) => {
  const ordersFbs = item.ordersFbs || {};
  const ordersFbw = item.ordersFbw || {};
  const addings = item.addingsToCart || {};
  const clicks = item.clicks || {};
  const ordersByDate = {};
  for (const date of new Set([
    ...Object.keys(ordersFbs),
    ...Object.keys(ordersFbw),
  ])) {
    ordersByDate[date] =
      (Number(ordersFbs[date]) || 0) + (Number(ordersFbw[date]) || 0);
  }

  const totalAddings = sumDaily(addings);
  const totalClicks = sumDaily(clicks);
  const totalOrders = sumDaily(ordersByDate);
  const totalAdsCosts = sumDaily(item.adsCosts);

  // EBITDA/день без рекламных расходов: по каждой дате Fbw + Fbs − adsCosts.
  const ebitdaFbw = item.totalEbitdaFbw || {};
  const ebitdaFbs = item.totalEbitdaFbs || {};
  const adsDaily = item.adsCosts || {};
  const ebitdaNoAds = {};
  for (const date of new Set([
    ...Object.keys(ebitdaFbw),
    ...Object.keys(ebitdaFbs),
    ...Object.keys(adsDaily),
  ])) {
    ebitdaNoAds[date] =
      (Number(ebitdaFbw[date]) || 0) +
      (Number(ebitdaFbs[date]) || 0) -
      (Number(adsDaily[date]) || 0) * (100 / 122);
  }

  // Процент выкупа храним в долях (делим исходные проценты на 100).
  const buyoutByDate = {};
  for (const date of Object.keys(item.buyoutPercent || {})) {
    const raw = Number(item.buyoutPercent[date]);
    buyoutByDate[date] = Number.isFinite(raw) ? raw / 100 : null;
  }
  // Процент выкупа по категории — также в долях (для линии бенчмарка).
  const categoryBuyoutByDate = {};
  for (const date of Object.keys(item.categoryBuyoutPercent || {})) {
    const raw = Number(item.categoryBuyoutPercent[date]);
    categoryBuyoutByDate[date] = Number.isFinite(raw) ? raw / 100 : null;
  }

  // Экономика рекламы (не процент, а значение):
  // avgCpo — средняя цена заказа (целое), medianBuyout — медианный выкуп в долях,
  // avgCps — средняя цена покупки/выкупа (округлённая).
  const avgCpo = totalOrders !== 0 ? Math.round(totalAdsCosts / totalOrders) : 0;
  const medianBuyout = medianDaily(buyoutByDate);
  const avgCps = medianBuyout !== 0 ? Math.round(avgCpo / medianBuyout) : 0;

  return {
    ...item,
    buyoutPercent: buyoutByDate,
    // Процент выкупа: медиана по дням (в долях) и медиана выкупа по категории.
    medianBuyoutPercent: medianDaily(buyoutByDate),
    medianCategoryBuyout: medianDaily(categoryBuyoutByDate),
    ordersSumFbs: sumDaily(ordersFbs),
    ordersSumFbw: sumDaily(ordersFbw),
    ordersSum: totalOrders,
    salesSumFbs: sumDaily(item.salesFbs),
    salesSumFbw: sumDaily(item.salesFbw),
    salesSum: sumDaily(item.salesFbs) + sumDaily(item.salesFbw),
    ebitdaDayFbs: avgDaily(item.totalEbitdaFbs),
    ebitdaDayFbw: avgDaily(item.totalEbitdaFbw),
    ebitdaDay: avgDaily(item.ebitda),
    // Среднее значение EBITDA по дням — база для ROI.
    avgEbitda: avgDaily(item.ebitda),
    // ROI: (avgEbitda − avgCps) / себестоимость без НДС, в долях.
    roi: computeRoi(avgDaily(item.ebitda), avgCps, item.selfpriceWithoutNds),
    stocksLastFbs: lastDaily(item.stocksFbs),
    stocksLastFbw: lastDaily(item.stocksFbw),
    stocksLast: lastDaily(item.stocksFbs) + lastDaily(item.stocksFbw),
    adsCostsSum: sumDaily(item.adsCosts),
    // EBITDA/день без рекламы: датасет по дням и его сумма.
    ebitdaNoAds,
    ebitdaNoAdsSum: sumDaily(ebitdaNoAds),
    // Экономика рекламы (значения, не проценты).
    avgCpo,
    medianBuyout,
    avgCps,
    // По датам (проценты).
    crToCart: ratioDaily(addings, clicks),
    crCartToOrder: ratioDaily(ordersByDate, addings),
    crClickToOrder: ratioDaily(ordersByDate, clicks),
    // Тоталы.
    totalAddingsToCart: totalAddings,
    totalClicks: totalClicks,
    totalCrToCart:
      totalClicks !== 0
        ? Math.round((totalAddings / totalClicks) * 100 * 100) / 100
        : 0,
    totalCartToOrder:
      totalAddings !== 0
        ? Math.round((totalOrders / totalAddings) * 100 * 100) / 100
        : 0,
    totalClickToOrder:
      totalClicks !== 0
        ? Math.round((totalOrders / totalClicks) * 100 * 100) / 100
        : 0,
  };
};

const initialState = {
  /** Список метрик SKU от бекенда */
  items: [],
  isLoading: false,
  error: null,
};

const skusMetricsSlice = createSlice({
  name: 'skusMetrics',
  initialState,
  reducers: {
    /** Добавляет тег артикулу в указанном поле (mainTags/clothTags/otherTags). */
    addSkuTag(state, action) {
      const { sku, field, tag } = action.payload;
      const item = state.items.find((it) => String(it.sku) === String(sku));
      if (!item) return;
      if (!Array.isArray(item[field])) item[field] = [];
      if (!item[field].includes(tag)) item[field] = [...item[field], tag];
      cache.clear();
    },
    /** Убирает тег у артикула в указанном поле. */
    removeSkuTag(state, action) {
      const { sku, field, tag } = action.payload;
      const item = state.items.find((it) => String(it.sku) === String(sku));
      if (!item) return;
      if (Array.isArray(item[field])) {
        item[field] = item[field].filter((t) => t !== tag);
      }
      cache.clear();
    },
    /**
     * Отвязывает удалённые теги от всех артикулов.
     * @param {Array<{ tag_name: string, type: string }>} action.payload —
     *   успешно удалённые теги.
     */
    removeSkuTags(state, action) {
      const removed = action.payload || [];
      const byType = { main: [], cloth: [], others: [] };
      removed.forEach(({ tag_name, type }) => {
        if (byType[type]) byType[type].push(String(tag_name));
      });
      state.items.forEach((item) => {
        Object.keys(TAG_FIELD_BY_TYPE).forEach((typeKey) => {
          const names = byType[typeKey];
          if (!names.length) return;
          const field = TAG_FIELD_BY_TYPE[typeKey];
          if (Array.isArray(item[field])) {
            item[field] = item[field].filter((t) => !names.includes(String(t)));
          }
        });
      });
      cache.clear();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkusMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSkusMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        // Элементы уже обогащены (в кэше или после порционной обработки).
        state.items = action.payload.items;
      })
      .addCase(fetchSkusMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Не удалось загрузить метрики SKU';
      });
  },
});

export default skusMetricsSlice.reducer;

export const { addSkuTag, removeSkuTag, removeSkuTags } = skusMetricsSlice.actions;
