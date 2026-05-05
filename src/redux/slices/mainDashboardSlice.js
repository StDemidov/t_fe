import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subDays } from 'date-fns';

import api from '../../utils/host';
import { clearCredentials } from './authSlice';
import { setError } from './errorSlice';

const initialState = {
  data: {
    incomeAndBuyoutData: {},
    investedAndStocksData: {},
    roiData: {},
    adsStatsData: {},
    topItemsData: {},
    lastUpdate: null,
  },
  loading: {
    lastUpdate: false,
    incomeAndBuyoutIsLoading: false,
    investedAndStocksIsLoading: false,
    roiIsLoading: false,
    adsStatsIsLoading: false,
    topItemsIsLoading: false,
  },
  filters: {
    dates: {
      startDate: null,
      endDate: null,
    },
    category: '', // '' = показывать данные "Всего"
  },
};

const makeThunk = (name) =>
  createAsyncThunk(name, async (url, thunkAPI) => {
    try {
      const res = await api.get(url);
      return res.data;
    } catch (error) {
      if (error.request.status === 401) {
        thunkAPI.dispatch(clearCredentials());
        thunkAPI.dispatch(setError('Повторите вход!'));
      } else {
        thunkAPI.dispatch(setError('Ошибка на сервере'));
      }
    }
  });

export const fetchLastUpdate = makeThunk('mainDashboard/fetchLastUpdate');
export const fetchIncomeAndBuyoutData = makeThunk(
  'mainDashboard/fetchIncomeAndBuyoutData'
);
export const fetchInvestedAndStocksData = makeThunk(
  'mainDashboard/fetchInvestedAndStocksData'
);
export const fetchRoiByCategory = makeThunk('mainDashboard/fetchRoiByCategory');
export const fetchAdsData = makeThunk('mainDashboard/fetchAdsData');
export const fetchTopItems = makeThunk('mainDashboard/fetchTopItems');

const mainDashboardSlice = createSlice({
  name: 'mainDashboard',
  initialState,
  reducers: {
    setDashboardDates: (state, action) => {
      state.filters.dates = action.payload;
    },
    setDashboardCategory: (state, action) => {
      state.filters.category = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLastUpdate.pending, (s) => {
      s.loading.lastUpdate = true;
    });
    builder.addCase(fetchLastUpdate.fulfilled, (state, action) => {
      state.loading.lastUpdate = false;
      if (action.payload) {
        const maxDate = subDays(new Date(action.payload), 1);
        state.data.lastUpdate = maxDate;
        if (state.filters.dates.endDate == null) {
          state.filters.dates.endDate = maxDate;
          state.filters.dates.startDate = subDays(new Date(action.payload), 15);
        }
      }
    });

    builder.addCase(fetchIncomeAndBuyoutData.pending, (s) => {
      s.loading.incomeAndBuyoutIsLoading = true;
    });
    builder.addCase(fetchIncomeAndBuyoutData.fulfilled, (state, action) => {
      state.loading.incomeAndBuyoutIsLoading = false;
      if (action.payload) state.data.incomeAndBuyoutData = action.payload;
    });

    builder.addCase(fetchInvestedAndStocksData.pending, (s) => {
      s.loading.investedAndStocksIsLoading = true;
    });
    builder.addCase(fetchInvestedAndStocksData.fulfilled, (state, action) => {
      state.loading.investedAndStocksIsLoading = false;
      if (action.payload) state.data.investedAndStocksData = action.payload;
    });

    builder.addCase(fetchRoiByCategory.pending, (s) => {
      s.loading.roiIsLoading = true;
    });
    builder.addCase(fetchRoiByCategory.fulfilled, (state, action) => {
      state.loading.roiIsLoading = false;
      if (action.payload) state.data.roiData = action.payload;
    });

    builder.addCase(fetchAdsData.pending, (s) => {
      s.loading.adsStatsIsLoading = true;
    });
    builder.addCase(fetchAdsData.fulfilled, (state, action) => {
      state.loading.adsStatsIsLoading = false;
      if (action.payload) state.data.adsStatsData = action.payload;
    });

    builder.addCase(fetchTopItems.pending, (s) => {
      s.loading.topItemsIsLoading = true;
    });
    builder.addCase(fetchTopItems.fulfilled, (state, action) => {
      state.loading.topItemsIsLoading = false;
      if (action.payload) state.data.topItemsData = action.payload;
    });
  },
});

export const { setDashboardDates, setDashboardCategory } =
  mainDashboardSlice.actions;

export const selectIncomeAndBuyoutData = (s) =>
  s.mainDashboard.data.incomeAndBuyoutData;
export const selectIncomeAndBuyoutIsLoading = (s) =>
  s.mainDashboard.loading.incomeAndBuyoutIsLoading;
export const selectInvestedAndStocksData = (s) =>
  s.mainDashboard.data.investedAndStocksData;
export const selectInvestedAndStocksIsLoading = (s) =>
  s.mainDashboard.loading.investedAndStocksIsLoading;
export const selectDashboardDates = (s) => s.mainDashboard.filters.dates;
export const selectLastUpdate = (s) => s.mainDashboard.data.lastUpdate;
export const selectRoiData = (s) => s.mainDashboard.data.roiData;
export const selectRoiIsLoading = (s) => s.mainDashboard.loading.roiIsLoading;
export const selectAdsStatsData = (s) => s.mainDashboard.data.adsStatsData;
export const selectAdsStatsIsLoading = (s) =>
  s.mainDashboard.loading.adsStatsIsLoading;
export const selectTopItemsData = (s) => s.mainDashboard.data.topItemsData;
export const selectTopItemsIsLoading = (s) =>
  s.mainDashboard.loading.topItemsIsLoading;
export const selectDashboardCategory = (s) => s.mainDashboard.filters.category;

export default mainDashboardSlice.reducer;
