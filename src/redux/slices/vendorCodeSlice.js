import axios from 'axios';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import createVendorCodeMetricsSingle from '../../utils/createVendorCodeMetricsSingle';
import createVendorCodeMetrics from '../../utils/createVendorCodeMetrics';
import {
  createTagsListCloth,
  createTagsListMain,
  createTagsListOthers,
} from '../../utils/createTagsList';
import { setError } from './errorSlice';
import { setNotification } from './notificationSlice';

const initialState = {
  vendorCodeMetrics: [],
  isLoading: false,
  tagsIsLoading: false,
  availableTagsMain: [],
  availableTagsCloth: [],
  availableTagsOthers: [],

  createTag: {
    main: [],
    cloth: [],
    others: [],
  },

  newSkusTagsMain: [],
  newSkusTagsCloth: [],
  newSkusTagsOthers: [],

  page: 1,
  vcsPerPage: 20,
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

export const uploadNewTags = createAsyncThunk(
  'tags/uploadNewTAgs',
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

export const deleteTags = createAsyncThunk(
  'tags/deleteTags',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, data);
      thunkAPI.dispatch(setNotification('Теги удалены!'));
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
    setNewAvailableTagMain: (state, action) => {
      state.availableTagsMain.push(...action.payload);
      state.createTag.main.push(...action.payload);
    },
    setNewSkusTagsMain: (state, action) => {
      state.newSkusTagsMain = updateSkusTags(
        action.payload,
        state.newSkusTagsMain
      );
    },
    setNewAvailableTagCloth: (state, action) => {
      state.availableTagsCloth.push(...action.payload);
      state.createTag.cloth.push(...action.payload);
    },
    setNewSkusTagsCloth: (state, action) => {
      state.newSkusTagsCloth = updateSkusTags(
        action.payload,
        state.newSkusTagsCloth
      );
    },
    setNewAvailableTagOthers: (state, action) => {
      state.availableTagsOthers.push(...action.payload);
      state.createTag.others.push(...action.payload);
    },
    setNewSkusTagsOthers: (state, action) => {
      state.newSkusTagsOthers = updateSkusTags(
        action.payload,
        state.newSkusTagsOthers
      );
    },
    setPageVendorcodes: (state, action) => {
      state.page = action.payload;
    },
    setVCsPerPageVendorcodes: (state, action) => {
      state.vcsPerPage = action.payload;
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
        state.availableTagsMain = createTagsListMain(action.payload);
        state.availableTagsCloth = createTagsListCloth(action.payload);
        state.availableTagsOthers = createTagsListOthers(action.payload);
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
    builder.addCase(uploadNewTags.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(uploadNewTags.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(deleteTags.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(deleteTags.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(createNewTag.fulfilled, (state, action) => {
      state.tagsIsLoading = false;
      if (action.payload) {
        state.createTag = {
          main: [],
          cloth: [],
          others: [],
        };
        state.newSkusTagsMain = [];
        state.newSkusTagsCloth = [];
        state.newSkusTagsOthers = [];
      }
    });
  },
});

export const {
  setNewAvailableTagMain,
  setNewSkusTagsMain,
  setNewAvailableTagCloth,
  setNewSkusTagsCloth,
  setNewAvailableTagOthers,
  setNewSkusTagsOthers,
  setPageVendorcodes,
  setVCsPerPageVendorcodes,
} = vendorCodeSlice.actions;

export const selectVendorCodeMetrics = (state) =>
  state.vendorCode.vendorCodeMetrics;

export const selectAvailableTagsMain = (state) =>
  state.vendorCode.availableTagsMain;
export const selectAvailableTagsCloth = (state) =>
  state.vendorCode.availableTagsCloth;
export const selectAvailableTagsOthers = (state) =>
  state.vendorCode.availableTagsOthers;

export const selectIsLoading = (state) => state.vendorCode.isLoading;
export const selectTagsIsLoading = (state) => state.vendorCode.tagsIsLoading;
export const selectCreateTag = (state) => state.vendorCode.createTag;

export const selectNewSkusTagsMain = (state) =>
  state.vendorCode.newSkusTagsMain;
export const selectNewSkusTagsCloth = (state) =>
  state.vendorCode.newSkusTagsCloth;
export const selectNewSkusTagsOthers = (state) =>
  state.vendorCode.newSkusTagsOthers;

export const selectPageVendorcodes = (state) => state.vendorCode.page;
export const selectVCsPerPageVendorcodes = (state) =>
  state.vendorCode.vcsPerPage;

export default vendorCodeSlice.reducer;
