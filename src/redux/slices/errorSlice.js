import { createSlice } from '@reduxjs/toolkit';

const initialState = '';

const errorSLice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    setError: (state, action) => {
      return action.payload;
    },
    clearError: () => {
      return initialState;
    },
  },
});

export const { setError, clearError } = errorSLice.actions;

export const selectErrorMessage = (state) => state.error;

export default errorSLice.reducer;
