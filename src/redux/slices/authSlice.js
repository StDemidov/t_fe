import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { setError } from './errorSlice';
import { setNotification } from './notificationSlice';
import createUser from '../../utils/createUser';

const initialState = {
  user: {
    username: null,
    token: null,
    role: null,
  },
  isLoading: false,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, data, {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      thunkAPI.dispatch(setNotification('Привет!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    clearCredentials: (state) => {
      state.user = initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        console.log(action.payload);
        state.user = createUser(action.payload);
      }
    });
    builder.addCase(login.pending, (state) => {
      state = initialState;
    });
  },
});

export const selectUser = (state) => state.auth.user;
export const selectIsLoading = (state) => state.auth.isLoading;
export const { clearCredentials } = authSlice.actions;
export default authSlice.reducer;
