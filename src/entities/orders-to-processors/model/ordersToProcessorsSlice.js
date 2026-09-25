import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchOrdersToProcessors as fetchPredictsApi } from '../api';
import { mapPredictItem } from '../utils/ordersDataMapper';
import { setError } from '../../../redux/slices/errorSlice';

/** Ключ диапазона дат для кэша. */
const rangeKey = ({ startDate, endDate }) => `${startDate}::${endDate}`;

// Кэш по диапазону: готовые элементы для мгновенного отображения при
// повторном заходе на страницу с тем же диапазоном (ключ → items).
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
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return out;
};

export const fetchOrdersToProcessors = createAsyncThunk(
  'ordersToProcessors/fetchPredicts',
  async (range, thunkAPI) => {
    const key = rangeKey(range);
    if (cache.has(key)) {
      return { fromCache: true, items: cache.get(key), key };
    }
    try {
      const payload = await fetchPredictsApi(range);
      const items = await enrichChunked(payload, mapPredictItem);
      cache.set(key, items);
      // Храним только последний диапазон — избегаем утечки памяти.
      if (cache.size > 1) {
        const oldest = cache.keys().next().value;
        if (oldest !== key) cache.delete(oldest);
      }
      return { fromCache: false, items, key };
    } catch (error) {
      thunkAPI.dispatch(
        setError(error.message || 'Не удалось загрузить прогнозы')
      );
      throw error;
    }
  }
);

/**
 * Сбрасывает кэш диапазонов — используется при ручных изменениях данных,
 * после которых повторный запрос того же диапазона должен вернуть свежее.
 */
export const invalidatePredictsCache = () => {
  cache.clear();
};

const initialState = {
  /** Список артикулов с прогнозами */
  items: [],
  isLoading: false,
  error: null,

  /** Ручные заказы { chartId: number } — персистятся */
  extraOrders: {},

  /** Даты начала расчёта { vendorCode: 'YYYY-MM-DD' } — персистятся */
  startCalcDates: {},
};

const ordersToProcessorsSlice = createSlice({
  name: 'ordersToProcessors',
  initialState,
  reducers: {
    updateExtraOrder(state, action) {
      const { chartId, value } = action.payload;
      if (value === 0 || value === '' || value === null) {
        delete state.extraOrders[chartId];
      } else {
        state.extraOrders[chartId] = value;
      }
    },
    clearExtraOrders(state) {
      state.extraOrders = {};
    },
    setStartCalcDates(state, action) {
      state.startCalcDates = action.payload;
    },
    updateStartCalcDate(state, action) {
      const { vendorCode, date } = action.payload;
      if (!date) delete state.startCalcDates[vendorCode];
      else state.startCalcDates[vendorCode] = date;
    },
    clearStartCalcDates(state) {
      state.startCalcDates = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersToProcessors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrdersToProcessors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
      })
      .addCase(fetchOrdersToProcessors.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message || 'Не удалось загрузить прогнозы';
      });
  },
});

export const {
  updateExtraOrder,
  clearExtraOrders,
  setStartCalcDates,
  updateStartCalcDate,
  clearStartCalcDates,
} = ordersToProcessorsSlice.actions;

export default ordersToProcessorsSlice.reducer;