import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import createCategoriesMetricsList from '../../utils/createCategoriesMetricsList';
import { setError } from './errorSlice';

const initialState = {
  categoriesMetricsData: [],
  isLoading: false,
};

export const fetchCategoriesMetrics = createAsyncThunk(
  'category/fetchCategoriesMetrics',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

const categoriesMetricsSlice = createSlice({
  name: 'categoriesMetrics',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCategoriesMetrics.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.categoriesMetricsData = createCategoriesMetricsList(
          action.payload
        );
      }
    });
    builder.addCase(fetchCategoriesMetrics.pending, (state) => {
      state.isLoading = true;
    });
  },
});

export const selectCategoriesMetrics = (state) =>
  state.categoriesMetrics.categoriesMetricsData;
export const selectIsLoading = (state) => state.categoriesMetrics.isLoading;

export default categoriesMetricsSlice.reducer;
