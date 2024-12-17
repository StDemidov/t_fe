import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import createAbcList from '../../utils/createAbcList';
import { setError } from './errorSlice';
import { setNotification } from './notificationSlice';

const initialState = {
  abcData: [],
  categories: {},
  isLoading: false,
  isDeleted: false,
};

export const fetchAbcInfo = createAsyncThunk(
  'abc/fetchAbcInfo',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const changeAbcInfo = createAsyncThunk(
  'abc/changeAbcInfo',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.patch(url, data);
      thunkAPI.dispatch(setNotification('Критерии успешно обновлены'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const deleteAbcInfo = createAsyncThunk(
  'abc/deleteAbcInfo',
  async (url, thunkAPI) => {
    try {
      const res = await axios.delete(url);
      thunkAPI.dispatch(setNotification('Критерии успешно удалены'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const createAbcInfo = createAsyncThunk(
  'abc/createAbcInfo',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, data);
      thunkAPI.dispatch(setNotification('Новые критерии успешно добавлены'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

const abcSlice = createSlice({
  name: 'abc',
  initialState: initialState,
  reducers: {
    setDeleted: (state) => {
      state.isDeleted = !state.isDeleted;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAbcInfo.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.abcData = createAbcList(action.payload.abclist);
        state.categories = createAbcList(action.payload.categories);
        state.isDeleted = false;
      }
    });
    builder.addCase(fetchAbcInfo.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(changeAbcInfo.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(changeAbcInfo.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(deleteAbcInfo.fulfilled, (state) => {
      state.isLoading = false;
      state.isDeleted = true;
    });
    builder.addCase(deleteAbcInfo.pending, (state) => {
      state.isLoading = true;
    });
  },
});

export const selectAbcData = (state) => state.abc.abcData;
export const selectCategories = (state) => state.abc.categories;
export const selectIsLoading = (state) => state.abc.isLoading;
export const selectIsDeleted = (state) => state.abc.isDeleted;

export default abcSlice.reducer;
