import { subDays, format } from 'date-fns'; // Для работы с датами

import api from '../../utils/host';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import createCampaignsList from '../../utils/createCampaignsList';
import createSkuDataForCamps from '../../utils/createSkuDataForCamps';

import { setError } from './errorSlice';
import { setNotification } from './notificationSlice';

import { clearCredentials } from './authSlice';
import createCampaignSingle from '../../utils/createCampaignSingle';
import convertKeysToCamelCase from '../../utils/createListWithConvertingToCamelCase';

const initialState = {
  allItems: [],
  regroupedItems: [],

  allItemsIsLoading: false,
  regroupingIsLoading: false,
  regroupIsCalculated: false,
  groupsUpdateInProcess: false,
  groupsUpdateIsFinished: false,

  filters: {
    category: '',
    patterns: [],
    style: '',
  },
};

export const fetchAllItems = createAsyncThunk(
  'regroup/fetchAllItems',
  async (url, thunkAPI) => {
    try {
      const res = await api.get(url);
      return res.data;
    } catch (error) {
      if (error.request.status == 401) {
        thunkAPI.dispatch(clearCredentials());
        thunkAPI.dispatch(setError('Повторите вход!'));
      } else {
        thunkAPI.dispatch(setError('Ошибка на сервере'));
      }
    }
  }
);

export const fetchRegroupedItems = createAsyncThunk(
  'regroup/fetchRegroupedItems',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await api.post(url, data);
      thunkAPI.dispatch(setNotification('Статус изменен!'));
      return res.data;
    } catch (error) {
      if (error.request.status == 401) {
        thunkAPI.dispatch(clearCredentials());
        thunkAPI.dispatch(setError('Повторите вход!'));
      } else {
        thunkAPI.dispatch(setError(error.response.data.detail));
      }
    }
  }
);

export const updateGroups = createAsyncThunk(
  'regroup/updateGroups',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await api.post(url, data);
      thunkAPI.dispatch(setNotification('Товары перегруппированы!'));
      return res.data;
    } catch (error) {
      if (error.request.status == 401) {
        thunkAPI.dispatch(clearCredentials());
        thunkAPI.dispatch(setError('Повторите вход!'));
      } else {
        thunkAPI.dispatch(setError(error.response.data.detail));
      }
    }
  }
);

const regroupSlice = createSlice({
  name: 'regroup',
  initialState: initialState,
  reducers: {
    setFilterPatterns: (state, action) => {
      state.filters.patterns = [...action.payload];
    },
    resetFilterPatterns: (state) => {
      state.filters.status = [];
    },
    setFilterCategory: (state, action) => {
      state.filters.category = action.payload;
    },
    resetFilterCategory: (state) => {
      state.filters.category = '';
    },
    setFilterStyle: (state, action) => {
      state.filters.style = action.payload;
    },
    resetFilterStyle: (state) => {
      state.filters.style = '';
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAllItems.fulfilled, (state, action) => {
      state.allItemsIsLoading = false;
      if (action.payload) {
        state.allItems = convertKeysToCamelCase(action.payload);
      }
    });
    builder.addCase(fetchAllItems.pending, (state) => {
      state.allItemsIsLoading = true;
    });
    builder.addCase(fetchRegroupedItems.fulfilled, (state, action) => {
      state.regroupingIsLoading = false;
      state.regroupIsCalculated = true;
      if (action.payload) {
        state.regroupedItems = createSkuDataForCamps(action.payload);
      }
    });
    builder.addCase(fetchRegroupedItems.pending, (state) => {
      state.regroupingIsLoading = true;
    });
  },
});

export const {
  setFilterCategory,
  resetFilterCategory,
  setFilterPatterns,
  resetFilterPatterns,
  setFilterStyle,
  resetFilterStyle,
} = regroupSlice.actions;

export const selectAllItems = (state) => state.regroup.allItems;
export const selectRegroupedItems = (state) => state.regroup.regroupedItems;

export const selectAllItemsIsLoading = (state) =>
  state.regroup.allItemsIsLoading;
export const selectRegroupingIsLoading = (state) =>
  state.regroup.regroupingIsLoading;
export const selectRegroupIsCalculated = (state) =>
  state.regroup.regroupIsCalculated;
export const selectGroupsUpdateInProcess = (state) =>
  state.regroup.groupsUpdateInProcess;
export const selectGroupsUpdateIsFinished = (state) =>
  state.regroup.groupsUpdateIsFinished;

export const selectRegroupFilterCategory = (state) =>
  state.regroup.filters.category;
export const selectRegroupFilterPatterns = (state) =>
  state.regroup.filters.patterns;

export default regroupSlice.reducer;
