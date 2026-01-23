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

import { clearCredentials } from './authSlice';
import createCampaignSingle from '../../utils/createCampaignSingle';

const today = new Date();

const todayFormatted = today.toISOString().split('T')[0];

// 14 дней назад
const daysAgo13 = new Date(today);
daysAgo13.setDate(today.getDate() - 13);
const daysAgo13Formatted = daysAgo13.toISOString().split('T')[0];

const initialState = {
  campaigns: [],
  last_update: '',
  skuData: [],
  isLoading: false,
  creatingIsLoading: false,
  cmpgnSingle: {},
  defaultSettings: {},
  currentPage: 1,
  changeIsLoading: false,
  dates: {
    start: daysAgo13Formatted,
    end: todayFormatted,
  },
  campaignsById: {},
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
        thunkAPI.dispatch(setError('Ошибка на сервере'));
      }
    }
  }
);

export const fetchCampaign = createAsyncThunk(
  'campaigns/fetchCampaign',
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

export const fetchDates = createAsyncThunk(
  'campaigns/fetchDates',
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

export const changeCampaignStatus = createAsyncThunk(
  'campaigns/changeCampaignStatus',
  async (url, thunkAPI) => {
    try {
      const res = await api.get(url);
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
      thunkAPI.dispatch(setNotification('Кампании успешно созданы!'));
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

export const editCampaigns = createAsyncThunk(
  'campaigns/editCampaigns',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await api.post(url, data);
      thunkAPI.dispatch(setNotification('Кампании успешно изменены!'));
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
    builder.addCase(fetchDates.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchDates.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.dates.end = action.payload;
        const date = new Date(action.payload);
        date.setDate(date.getDate() - 13);
        state.dates.start = date.toISOString().split('T')[0];
        console.log(state.dates);
      }
    });
    builder.addCase(changeCampaignStatus.pending, (state) => {
      state.changeIsLoading = true;
    });
    builder.addCase(changeCampaignStatus.fulfilled, (state, action) => {
      state.changeIsLoading = false;
      console.log(action);
      if (action.payload) {
        state.campaigns = state.campaigns.map((campaign) =>
          Number(campaign.campId) === Number(action.payload.camp_id)
            ? {
                ...campaign,
                status: action.payload.new_status,
                pausedByUser: action.payload.action === 'pause' ? true : false,
                pausedByTime:
                  action.payload.action === 'pause'
                    ? false
                    : action.payload.action === 'start' &&
                      action.payload.new_status === 11
                    ? true
                    : false,
                pausedByTurnover: false,
              }
            : campaign
        );
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
    builder.addCase(editCampaigns.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(editCampaigns.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.campaigns = createCampaignsList(action.payload);
      }
    });
    builder.addCase(fetchCampaign.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchCampaign.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        const newCamp = createCampaignSingle(action.payload);
        const [id] = Object.keys(newCamp);
        state.campaignsById[id] = newCamp[id];
      }
    });
  },
});

export const { setCurrentPage } = campaignsSlice.actions;

export const selectCampaigns = (state) => state.campaigns.campaigns;
export const selectCurrentPage = (state) => state.campaigns.currentPage;
export const selectSkuData = (state) => state.campaigns.skuData;
export const selectIsLoading = (state) => state.campaigns.isLoading;
export const selectChangeIsLoading = (state) => state.campaigns.changeIsLoading;
export const selectCampaignById = (id) => (state) =>
  state.campaigns.campaignsById[id];
export const selectDates = (state) => state.campaigns.dates;

export default campaignsSlice.reducer;
