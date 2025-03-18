import axios from 'axios';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import createBarcodesList from '../../utils/createBarcodesList';
import { setError } from './errorSlice';
import { setNotification } from './notificationSlice';

const initialState = {
  barcodesData: [],
  ordersData: {},
  isLoading: false,
  page: 1,
};

export const fetchBarcodes = createAsyncThunk(
  'barcode/fetchBarcodes',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const createOrder = createAsyncThunk(
  'barcode/createOrder',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, data);
      thunkAPI.dispatch(setNotification('Заказ успешно создан!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const deleteOrders = createAsyncThunk(
  'barcode/deleteOrders',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, data);
      thunkAPI.dispatch(setNotification('Заказы успешно удалены!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

const barcodeSlice = createSlice({
  name: 'barcode',
  initialState: initialState,
  reducers: {
    setPageBarcode: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBarcodes.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        const dataFromApi = (state.barcodesData = createBarcodesList(
          action.payload
        ));
        state.barcodesData = dataFromApi.bcData;
        state.ordersData = dataFromApi.orders;
      }
    });
    builder.addCase(fetchBarcodes.pending, (state) => {
      state.isLoading = true;
    });
  },
});

export const { setPageBarcode } = barcodeSlice.actions;

export const selectBarcodes = (state) => state.barcode.barcodesData;
export const selectIsLoading = (state) => state.barcode.isLoading;
export const selectOrders = (state) => state.barcode.ordersData;
export const selectPage = (state) => state.barcode.page;

export default barcodeSlice.reducer;
