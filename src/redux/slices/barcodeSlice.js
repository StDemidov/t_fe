import axios from 'axios';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import createBarcodesList from '../../utils/createBarcodesList';
import { setError } from './errorSlice';

const initialState = { barcodesData: [], isLoading: false };

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

const barcodeSlice = createSlice({
  name: 'barcode',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBarcodes.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.barcodesData = createBarcodesList(action.payload);
      }
    });
    builder.addCase(fetchBarcodes.pending, (state) => {
      state.isLoading = true;
    });
  },
});

export const selectBarcodes = (state) => state.barcode.barcodesData;
export const selectIsLoading = (state) => state.barcode.isLoading;

export default barcodeSlice.reducer;
