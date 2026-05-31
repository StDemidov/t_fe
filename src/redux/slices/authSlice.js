import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import createUser from '../../utils/createUser';

const initialState = {
  user: {
    phone: null,
    token: null,
    permissions: { is_admin: false },
  },
  isLoading: false,
};

// Step 1: Login with phone + password → returns { temp_token, qr_uri }
export const login = createAsyncThunk(
  'auth/login',
  async ({ phone, password, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, { phone, password }, {
        headers: { 'Content-Type': 'application/json' },
      });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail || error.message
      );
    }
  }
);

// Step 2a: Verify TOTP code → returns { token, permissions }
export const verify2fa = createAsyncThunk(
  'auth/verify2fa',
  async ({ code, tempToken, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, { code }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tempToken}`,
        },
      });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail || error.message
      );
    }
  }
);

// Step 2b: Login by recovery code → returns { token, permissions }
export const loginByRecoveryCode = createAsyncThunk(
  'auth/loginByRecoveryCode',
  async ({ recoveryCode, tempToken, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, { recovery_code: recoveryCode }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tempToken}`,
        },
      });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail || error.message
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearCredentials: (state) => {
      state.user = initialState.user;
    },
  },
  extraReducers: (builder) => {
    // login
    builder
      .addCase(login.pending,    (state) => { state.isLoading = true; })
      .addCase(login.fulfilled,  (state) => { state.isLoading = false; })
      .addCase(login.rejected,   (state) => { state.isLoading = false; });

    // verify2fa — writes token+permissions into state.user on success
    builder
      .addCase(verify2fa.pending,   (state) => { state.isLoading = true; })
      .addCase(verify2fa.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.token) {
          state.user = createUser(action.payload);
        }
      })
      .addCase(verify2fa.rejected, (state) => { state.isLoading = false; });

    // loginByRecoveryCode — same
    builder
      .addCase(loginByRecoveryCode.pending,   (state) => { state.isLoading = true; })
      .addCase(loginByRecoveryCode.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.token) {
          state.user = createUser(action.payload);
        }
      })
      .addCase(loginByRecoveryCode.rejected, (state) => { state.isLoading = false; });
  },
});

export const selectUser        = (state) => state.auth.user;
export const selectIsLoading   = (state) => state.auth.isLoading;
export const { clearCredentials } = authSlice.actions;
export default authSlice.reducer;
