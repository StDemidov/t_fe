import axios from 'axios';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import createAutoCampaignsList from '../../utils/createAutoCampaignsList';
import createSkuDataForAutoCampaigns from '../../utils/createSkuDataForAutoCampaigns';
import createCmpgnSingle from '../../utils/createCmpgnSingle';
import { setError } from './errorSlice';
import { setNotification } from './notificationSlice';

const initialState = {
  autoCampaigns: [],
  skuData: [],
  isLoading: false,
  cmpgnSingle: {},
};

export const fetchAutoCampaigns = createAsyncThunk(
  'autoCampaigns/fetchAutoCampaigns',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const fetchSkuData = createAsyncThunk(
  'autoCampaigns/fetchSkuData',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const fetchAutoCampaignById = createAsyncThunk(
  'autoCampaigns/fetchAutoCampaignById',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const pauseCampaign = createAsyncThunk(
  'autoCampaigns/pauseCampaign',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      thunkAPI.dispatch(setNotification('Кампания приостановлена.'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const runCampaign = createAsyncThunk(
  'autoCampaigns/runCampaign',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      thunkAPI.dispatch(setNotification('Кампания запущена.'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const endCampaign = createAsyncThunk(
  'autoCampaigns/endCampaign',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      thunkAPI.dispatch(setNotification('Кампания завершена.'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const createAutoCampaign = createAsyncThunk(
  'autoCampaigns/createAutoCampaign',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, data);
      thunkAPI.dispatch(setNotification('Кампания успешно создана!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const editAutoCampaign = createAsyncThunk(
  'autoCampaigns/editAutoCampaign',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.patch(url, data);
      thunkAPI.dispatch(setNotification('Кампания успешно изменена!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

const autoCampaignsSlice = createSlice({
  name: 'autoCampaigns',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAutoCampaigns.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.autoCampaigns = createAutoCampaignsList(action.payload);
      }
    });
    builder.addCase(fetchAutoCampaigns.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchAutoCampaignById.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.cmpgnSingle = createCmpgnSingle(action.payload);
      }
    });
    builder.addCase(fetchAutoCampaignById.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(fetchSkuData.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.skuData = createSkuDataForAutoCampaigns(action.payload);
      }
    });
    builder.addCase(fetchSkuData.pending, (state) => {
      state.isLoading = true;
    });
  },
});

export const selectAutoCampaigns = (state) => state.autoCampaigns.autoCampaigns;
export const selectIsLoading = (state) => state.autoCampaigns.isLoading;
export const selectSkuDataAutoCmpgns = (state) => state.autoCampaigns.skuData;
export const selectCmpgnSingle = (state) => state.autoCampaigns.cmpgnSingle;

export default autoCampaignsSlice.reducer;
