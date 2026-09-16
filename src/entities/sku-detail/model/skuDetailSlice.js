import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchSkuDetail as fetchSkuDetailApi,
  fetchCardMetrics as fetchCardMetricsApi,
  getDefaultSkuDetailRange,
} from '../api';
import { setError } from '../../../redux/slices/errorSlice';

/**
 * Загружает детальные данные одного товара и хранит их в store по ключу sku.
 * Отдельные страницы товаров могут быть открыты одновременно в разных вкладках —
 * данные каждого SKU хранятся независимо в state.bySku[sku].
 */
export const fetchSkuDetail = createAsyncThunk(
  'skuDetail/fetch',
  async ({ sku, range }, thunkAPI) => {
    const resolvedRange = range || getDefaultSkuDetailRange();
    try {
      const result = await fetchSkuDetailApi({ sku, range: resolvedRange });
      return {
        sku: String(sku),
        data: result.data,
        range: result.range,
      };
    } catch (error) {
      thunkAPI.dispatch(
        setError(error.message || 'Не удалось загрузить данные товара')
      );
      throw error;
    }
  }
);

const initialState = {
  /** Данные по каждому SKU: { [sku]: { data, cardMetrics, range, isLoading, error } } */
  bySku: {},
};

/** Загружает метрики карточки товара (card_metrics) и кладёт в bySku[sku]. */
export const fetchCardMetrics = createAsyncThunk(
  'skuDetail/fetchCardMetrics',
  async ({ sku }, thunkAPI) => {
    try {
      const cardMetrics = await fetchCardMetricsApi({ sku });
      return { sku: String(sku), cardMetrics };
    } catch (error) {
      thunkAPI.dispatch(
        setError(error.message || 'Не удалось загрузить метрики карточки')
      );
      throw error;
    }
  }
);

const skuDetailSlice = createSlice({
  name: 'skuDetail',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkuDetail.pending, (state, action) => {
        const sku = String(action.meta.arg.sku);
        state.bySku[sku] = {
          ...(state.bySku[sku] || {}),
          sku,
          isLoading: true,
          error: null,
        };
      })
      .addCase(fetchSkuDetail.fulfilled, (state, action) => {
        const { sku, data, range } = action.payload;
        state.bySku[sku] = {
          ...(state.bySku[sku] || {}),
          sku,
          data,
          range,
          isLoading: false,
          error: null,
        };
      })
      .addCase(fetchSkuDetail.rejected, (state, action) => {
        const sku = String(action.meta.arg.sku);
        state.bySku[sku] = {
          ...(state.bySku[sku] || {}),
          sku,
          isLoading: false,
          error: action.error.message || 'Не удалось загрузить данные товара',
        };
      })
      .addCase(fetchCardMetrics.fulfilled, (state, action) => {
        const { sku, cardMetrics } = action.payload;
        state.bySku[sku] = {
          ...(state.bySku[sku] || {}),
          sku,
          cardMetrics,
          cardMetricsError: null,
        };
      })
      .addCase(fetchCardMetrics.rejected, (state, action) => {
        const sku = String(action.meta.arg.sku);
        state.bySku[sku] = {
          ...(state.bySku[sku] || {}),
          sku,
          cardMetricsError:
            action.error.message || 'Не удалось загрузить метрики карточки',
        };
      });
  },
});

export default skuDetailSlice.reducer;