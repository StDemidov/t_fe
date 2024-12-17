import axios from 'axios';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import createVendorCodeMetrics from '../../utils/createVendorCodeMetrics';
import { setError } from './errorSlice';
import { setNotification } from './notificationSlice';

const initialState = { vendorCodeMetrics: [], isLoading: false };

export const fetchVendorCodeMetrics = createAsyncThunk(
  'vendorCode/fetchVendorCodeMetrics',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const setVendorCodeDate = createAsyncThunk(
  'vendorCode/setVendorCodeDate',
  async (url, thunkAPI) => {
    try {
      const res = await axios.post(url);
      thunkAPI.dispatch(setNotification('Дата успешно обновлена'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const sendVendorCodePhoto = createAsyncThunk(
  'vendorCode/sendVendorCodePhoto',
  async ({ formData, url }, thunkAPI) => {
    const headers = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    try {
      const res = await axios.post(url, formData, headers);
      thunkAPI.dispatch(setNotification('Фотография успешно обновлена'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

const vendorCodeSlice = createSlice({
  name: 'vendorCode',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchVendorCodeMetrics.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.vendorCodeMetrics = createVendorCodeMetrics(action.payload);
      }
    });
    builder.addCase(fetchVendorCodeMetrics.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(sendVendorCodePhoto.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(sendVendorCodePhoto.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(setVendorCodeDate.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(setVendorCodeDate.fulfilled, (state) => {
      state.isLoading = false;
    });
  },
});

export const selectVendorCodeMetrics = (state) =>
  state.vendorCode.vendorCodeMetrics;
export const selectIsLoading = (state) => state.vendorCode.isLoading;

export default vendorCodeSlice.reducer;
