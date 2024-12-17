import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import createEbitdaSettings from '../../utils/createEbitdaSettings';
import { setError } from './errorSlice';
import { setNotification } from './notificationSlice';

const initialState = {
  ebitdaSettings: null,
  isLoading: false,
};

export const fetchEbitdaSettings = createAsyncThunk(
  'ebitdaSettings/fetchEbitdaSettings',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const changeEbitdaSettings = createAsyncThunk(
  'ebitdaSettings/changeEbitdaSettings',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.patch(url, data);
      thunkAPI.dispatch(setNotification('Параметры успешно обновлены'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

const ebitdaSettingsSlice = createSlice({
  name: 'ebitdaSettings',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchEbitdaSettings.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.ebitdaSettings = createEbitdaSettings(action.payload);
      }
    });
    builder.addCase(fetchEbitdaSettings.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(changeEbitdaSettings.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(changeEbitdaSettings.pending, (state) => {
      state.isLoading = true;
    });
  },
});

export const selectEbitdaSettings = (state) =>
  state.ebitdaSettings.ebitdaSettings;
export const selectIsLoading = (state) => state.ebitdaSettings.isLoading;

export default ebitdaSettingsSlice.reducer;
