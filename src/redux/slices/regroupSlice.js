import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import api from '../../utils/host';
import { clearCredentials } from './authSlice';
import createSkuDataForCamps from '../../utils/createSkuDataForCamps';
import convertKeysToCamelCase from '../../utils/createListWithConvertingToCamelCase';
import { setError } from './errorSlice';
import { setNotification } from './notificationSlice';

const initialState = {
  allItems: [],
  regroupedItems: [],
  selectedSkus: [],
  failedGroups: [],

  allItemsIsLoading: false,
  regroupingIsLoading: false,
  regroupIsCalculated: false,
  groupsUpdateInProcess: false,
  groupsUpdateIsFinished: false,
  groupsUpdateError: false,
  checkUnfilledSKU: false,
  uploadingPatternsIsLoading: false,

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
      thunkAPI.dispatch(setNotification('Расчет произведен!'));
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

export const uploadPatterns = createAsyncThunk(
  'regroup/uploadPatterns',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await api.post(url, data);
      thunkAPI.dispatch(setNotification('Лекала загружены!'));
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
    setRegroupFilterPatterns: (state, action) => {
      state.filters.patterns = [...action.payload];
    },
    setGroups: (state, action) => {
      state.regroupedItems = [...action.payload];
    },
    resetRegroupFilterPatterns: (state) => {
      state.filters.patterns = [];
    },
    setRegroupFilterCategory: (state, action) => {
      state.filters.category = action.payload;
    },
    setCheckUnfilledSkus: (state, action) => {
      state.checkUnfilledSKU = action.payload;
    },
    resetRegroupFilterCategory: (state) => {
      state.filters.category = '';
    },
    setRegroupFilterStyle: (state, action) => {
      state.filters.style = action.payload;
    },
    resetRegroupFilterStyle: (state) => {
      state.filters.style = '';
    },
    setSelectedSkus: (state, action) => {
      state.selectedSkus = action.payload;
    },
    toggleSku: (state, action) => {
      const sku = action.payload;
      if (state.selectedSkus.includes(sku)) {
        state.selectedSkus = state.selectedSkus.filter((s) => s !== sku);
      } else {
        state.selectedSkus.push(sku);
      }
    },
    resetSelectedSkus: (state) => {
      state.selectedSkus = [];
    },
    returnToStart: (state) => {
      state.regroupIsCalculated = false;
      state.groupsUpdateError = false;
      state.groupsUpdateIsFinished = false;
      state.regroupedItems = [];
      state.failedGroups = [];
      state.checkUnfilledSKU = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAllItems.fulfilled, (state, action) => {
      state.allItemsIsLoading = false;
      if (action.payload) {
        state.allItems = convertKeysToCamelCase(action.payload);
      }
    });
    builder.addCase(uploadPatterns.pending, (state) => {
      state.uploadingPatternsIsLoading = true;
    });
    builder.addCase(uploadPatterns.fulfilled, (state, action) => {
      state.uploadingPatternsIsLoading = false;
    });
    builder.addCase(fetchAllItems.pending, (state) => {
      state.allItemsIsLoading = true;
    });
    builder.addCase(fetchRegroupedItems.pending, (state) => {
      state.regroupingIsLoading = true;
    });
    builder.addCase(fetchRegroupedItems.fulfilled, (state, action) => {
      state.regroupingIsLoading = false;
      if (action.payload) {
        state.regroupIsCalculated = true;
        state.regroupedItems = action.payload.map((item) =>
          convertKeysToCamelCase(item)
        );
      }
    });
    builder.addCase(updateGroups.pending, (state) => {
      state.groupsUpdateInProcess = true;
    });
    builder.addCase(updateGroups.fulfilled, (state, action) => {
      state.groupsUpdateInProcess = false;
      state.groupsUpdateIsFinished = true;
      if (action.payload) {
        if (action.payload.length === 0) {
          state.regroupIsCalculated = false;
          state.regroupedItems = [];
        } else {
          state.groupsUpdateError = true;
          state.failedGroups = action.payload;
        }
      }
    });
  },
});

export const {
  setRegroupFilterCategory,
  resetRegroupFilterCategory,
  setRegroupFilterPatterns,
  resetRegroupFilterPatterns,
  setRegroupFilterStyle,
  resetRegroupFilterStyle,
  setSelectedSkus,
  toggleSku,
  resetSelectedSkus,
  setGroups,
  returnToStart,
  setCheckUnfilledSkus,
} = regroupSlice.actions;

export const selectAllItems = (state) => state.regroup.allItems;
export const selectRegroupedItems = (state) => state.regroup.regroupedItems;
export const selectFailedGroups = (state) => state.regroup.failedGroups;

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
export const selectGroupsUpdateError = (state) =>
  state.regroup.groupsUpdateError;
export const selectUploadingPatternsIsLoading = (state) =>
  state.regroup.uploadingPatternsIsLoading;

export const selectRegroupFilterCategory = (state) =>
  state.regroup.filters.category;
export const selectRegroupFilterPatterns = (state) =>
  state.regroup.filters.patterns;
export const selectRegroupFilterStyle = (state) => state.regroup.filters.style;
export const selectSelectedSkus = (state) => state.regroup.selectedSkus;
export const selectCheckUnfilledSKUs = (state) =>
  state.regroup.checkUnfilledSKU;
export default regroupSlice.reducer;
