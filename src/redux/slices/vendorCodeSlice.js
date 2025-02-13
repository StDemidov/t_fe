import axios from 'axios';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import createVendorCodeMetricsSingle from '../../utils/createVendorCodeMetricsSingle';
import createVendorCodeMetrics from '../../utils/createVendorCodeMetrics';
import createTagsList from '../../utils/createTagsList';
import { setError } from './errorSlice';
import { setNotification } from './notificationSlice';

const initialState = {
  vendorCodeMetrics: [],
  isLoading: false,
  availableTags: [],
  tagsIsLoading: false,
  createTag: [],
  newSkusTags: [],
};

function updateSkusTags(obj, newSkusTags) {
  for (const key in obj) {
    const existingItem = newSkusTags.find((item) => item.hasOwnProperty(key));

    if (existingItem) {
      existingItem[key] = obj[key];
    } else {
      newSkusTags.push({ [key]: obj[key] });
    }
  }
  return newSkusTags;
}

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

export const fetchAvailableTags = createAsyncThunk(
  'vendorCode/fetchAvailableTags',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const fetchVendorCodeMetricsSingle = createAsyncThunk(
  'vendorCode/fetchVendorCodeMetricsSingle',
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

export const createNewTag = createAsyncThunk(
  'vendorCode/createNewTag',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, data);
      thunkAPI.dispatch(setNotification('Теги созданы'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

const vendorCodeSlice = createSlice({
  name: 'vendorCode',
  initialState: initialState,
  reducers: {
    setNewAvailableTag: (state, action) => {
      state.availableTags.push(...action.payload);
      state.createTag.push(...action.payload);
    },
    setNewSkusTags: (state, action) => {
      state.newSkusTags = updateSkusTags(action.payload, state.newSkusTags);
    },
  },
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
    builder.addCase(fetchAvailableTags.fulfilled, (state, action) => {
      state.tagsIsLoading = false;
      if (action.payload) {
        state.availableTags = createTagsList(action.payload);
      }
    });
    builder.addCase(fetchAvailableTags.pending, (state) => {
      state.tagsIsLoading = true;
    });
    builder.addCase(fetchVendorCodeMetricsSingle.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.vendorCodeMetrics = createVendorCodeMetricsSingle(action.payload);
      }
    });
    builder.addCase(fetchVendorCodeMetricsSingle.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(setVendorCodeDate.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(setVendorCodeDate.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(createNewTag.pending, (state) => {
      state.tagsIsLoading = true;
    });
    builder.addCase(createNewTag.fulfilled, (state, action) => {
      state.tagsIsLoading = false;
      if (action.payload) {
        state.createTag = [];
        state.newSkusTags = [];
      }
    });
  },
});

export const { setNewAvailableTag, setNewSkusTags } = vendorCodeSlice.actions;

export const selectVendorCodeMetrics = (state) =>
  state.vendorCode.vendorCodeMetrics;
export const selectAvailableTags = (state) => state.vendorCode.availableTags;
export const selectIsLoading = (state) => state.vendorCode.isLoading;
export const selectTagsIsLoading = (state) => state.vendorCode.tagsIsLoading;
export const selectCreateTag = (state) => state.vendorCode.createTag;
export const selectNewSkusTags = (state) => state.vendorCode.newSkusTags;

export default vendorCodeSlice.reducer;
