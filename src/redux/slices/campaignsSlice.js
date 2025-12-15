import axios from 'axios';

import api, { hostName } from '../../utils/host';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import createCampaignsList from '../../utils/createCampaignsList';
import createSkuDataForCamps from '../../utils/createSkuDataForCamps';

import createSkuDataForAutoCampaigns from '../../utils/createSkuDataForAutoCampaigns';
import createCmpgnSingle from '../../utils/createCmpgnSingle';
import { setError } from './errorSlice';
import { setNotification } from './notificationSlice';
import createAutoCampDefaultSettings from '../../utils/createAutoCampDefaultSettings';

const initialState = {
  campaigns: [],
  last_update: '',
  skuData: [],
  isLoading: false,
  creatingIsLoading: false,
  cmpgnSingle: {},
  defaultSettings: {},
  currentPage: 1,
};

export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async (url, thunkAPI) => {
    try {
      const res = await api.get(url);
      return res.data;
    } catch (error) {
      if (error.request.status == 401) {
        thunkAPI.dispatch(clearCredentials());
        thunkAPI.dispatch(setError('Повторите вход!'));
      } else {
        thunkAPI.dispatch(setError(error.message));
      }
    }
  }
);

export const fetchSkuData = createAsyncThunk(
  'campaigns/fetchSkuData',
  async (url, thunkAPI) => {
    try {
      const res = await api.get(url);
      return res.data;
    } catch (error) {
      if (error.request.status == 401) {
        thunkAPI.dispatch(clearCredentials());
        thunkAPI.dispatch(setError('Повторите вход!'));
      } else {
        thunkAPI.dispatch(setError(error.message));
      }
    }
  }
);

// export const startTest = createAsyncThunk(
//   'abTests/startTest',
//   async ({ data, url }, thunkAPI) => {
//     const state = store.getState();
//     const token = state.auth.user?.token; // токен из Redux
//     try {
//       // шаг 1 — отправляем POST
//       const response = await api.post(url, data);
//       if (!response.data) {
//         throw new Error('Ошибка запуска теста');
//       }
//     }
//      catch (err) {
//         return thunkAPI.rejectWithValue(err.message);
//       }

export const createCampaigns = createAsyncThunk(
  'campaigns/createCampaigns',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await api.post(url, data);
      thunkAPI.dispatch(setNotification('Кампаниb успешно создана!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState: initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCampaigns.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.campaigns = createCampaignsList(action.payload);
      }
    });
    builder.addCase(fetchCampaigns.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchSkuData.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.skuData = createSkuDataForCamps(action.payload);
      }
    });
    builder.addCase(fetchSkuData.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(createCampaigns.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(createCampaigns.fulfilled, (state) => {
      state.isLoading = false;
    });
  },
});

export const { setCurrentPage } = campaignsSlice.actions;

export const selectCampaigns = (state) => state.campaigns.campaigns;
export const selectCurrentPage = (state) => state.campaigns.currentPage;
export const selectSkuData = (state) => state.campaigns.skuData;
export const selectIsLoading = (state) => state.campaigns.isLoading;

export default campaignsSlice.reducer;
