import axios from 'axios';
import api from '../../../utils/host';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mapInventoryApiResponse } from '../utils/inventoryDataMapper';
import { setError } from '../../../redux/slices/errorSlice';
import { setNotification } from '../../../redux/slices/notificationSlice';

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (url, thunkAPI) => {
    try {
      const res = await api.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const createInventoryOrder = createAsyncThunk(
  'inventory/createOrder',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await api.post(url, data);
      thunkAPI.dispatch(setNotification('Заказ успешно создан!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const deleteInventoryOrders = createAsyncThunk(
  'inventory/deleteOrders',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await api.post(url, data);
      thunkAPI.dispatch(setNotification('Заказы успешно удалены!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  /** Список артикулов после маппинга */
  skuList: [],
  /** Словарь заказов { barcode: [{name, amount, date}] } */
  ordersMap: {},
  /** Загрузка данных с сервера */
  isLoading: false,

  /** Локальные вводы заказов { barcode: number } — персистируются */
  extraStock: {},

  /** Даты начала расчёта { vcName: 'YYYY-MM-DD' } — персистируются */
  startCalcDates: {},
  /** Текущая страница пагинации */
  currentPage: 1,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setInventoryPage(state, action) {
      state.currentPage = action.payload;
    },
    setExtraStock(state, action) {
      state.extraStock = action.payload;
    },
    updateExtraStockItem(state, action) {
      const { barcode, value } = action.payload;
      if (value === 0 || value === '' || value === null) {
        delete state.extraStock[barcode];
      } else {
        state.extraStock[barcode] = value;
      }
    },
    clearExtraStock(state) {
      state.extraStock = {};
    },
    setStartCalcDates(state, action) {
      state.startCalcDates = action.payload;
    },
    updateStartCalcDate(state, action) {
      const { vcName, date } = action.payload;
      if (!date) delete state.startCalcDates[vcName];
      else state.startCalcDates[vcName] = date;
    },
    clearStartCalcDates(state) {
      state.startCalcDates = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const mapped = mapInventoryApiResponse(action.payload);
          state.skuList = mapped.skuList;
          state.ordersMap = mapped.ordersMap;
        }
      });
  },
});

export const {
  setInventoryPage,
  setExtraStock,
  updateExtraStockItem,
  clearExtraStock,
  setStartCalcDates,
  updateStartCalcDate,
  clearStartCalcDates,
} = inventorySlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectInventorySkuList = (state) => state.inventory.skuList;
export const selectInventoryOrdersMap = (state) => state.inventory.ordersMap;
export const selectInventoryIsLoading = (state) => state.inventory.isLoading;
export const selectInventoryCurrentPage = (state) =>
  state.inventory.currentPage;
export const selectExtraStock = (state) => state.inventory.extraStock ?? {};
export const selectStartCalcDates = (state) =>
  state.inventory.startCalcDates ?? {};

export default inventorySlice.reducer;
