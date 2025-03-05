import axios from 'axios';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import createAucCampaignsList from '../../utils/createAucCampaignsList';
import createAucCmpgnSingleMain from '../../utils/createAucCmpgnSingleMain';
import createCmpgnSingle from '../../utils/createCmpgnSingle';
import { setError } from './errorSlice';
import { setNotification } from './notificationSlice';

const initialState = {
  aucCampaigns: [],
  isLoading: false,
  cmpgnSingle: {},
};

export const fetchAucCampaigns = createAsyncThunk(
  'aucCampaigns/fetchAucCampaigns',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const fetchAucCampaignByIdMain = createAsyncThunk(
  'aucCampaigns/fetchAucCampaignByIdMain',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const fetchAucCampaignById = createAsyncThunk(
  'aucCampaigns/fetchAucCampaignById',
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
  'aucCampaigns/pauseCampaign',
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
  'aucCampaigns/runCampaign',
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
  'aucCampaigns/endCampaign',
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

export const endCampaignFull = createAsyncThunk(
  'aucCampaigns/endCampaignFull',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      thunkAPI.dispatch(setNotification('Кампании отключены.'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const pauseCampaignFull = createAsyncThunk(
  'aucCampaigns/pauseCampaignFull',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      thunkAPI.dispatch(setNotification('Кампании поставлены на паузу.'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const runCampaignFull = createAsyncThunk(
  'aucCampaigns/runCampaignFull',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      thunkAPI.dispatch(setNotification('Кампании запущены.'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const createAucCampaign = createAsyncThunk(
  'aucCampaigns/createAucCampaign',
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

export const editAucCampaign = createAsyncThunk(
  'aucCampaigns/editAucCampaign',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, data);
      thunkAPI.dispatch(setNotification('Кампания успешно изменена!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

const aucCampaignsSlice = createSlice({
  name: 'aucCampaigns',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAucCampaigns.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.aucCampaigns = createAucCampaignsList(action.payload);
      }
    });
    builder.addCase(fetchAucCampaigns.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchAucCampaignByIdMain.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.cmpgnSingle = createAucCmpgnSingleMain(action.payload);
      }
    });
    builder.addCase(fetchAucCampaignByIdMain.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchAucCampaignById.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.cmpgnSingle = createAucCmpgnSingleMain(action.payload);
      }
    });
    builder.addCase(fetchAucCampaignById.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(editAucCampaign.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(editAucCampaign.fulfilled, (state) => {
      state.isLoading = false;
    });
  },
});

export const selectAucCampaigns = (state) => state.aucCampaigns.aucCampaigns;
export const selectIsLoading = (state) => state.aucCampaigns.isLoading;
export const selectCmpgnSingle = (state) => state.aucCampaigns.cmpgnSingle;

export default aucCampaignsSlice.reducer;
