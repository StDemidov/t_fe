import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setError } from './errorSlice';
import { setNotification } from './notificationSlice';

const initialState = { isLoading: false, failedSkus: [] };

export const uploadPhoto = createAsyncThunk(
  'system/uploadPhoto',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, data);
      const failedSkus = res.data;

      if (Array.isArray(failedSkus) && failedSkus.length > 0) {
        // Вернём в payload список артикулов, для которых не удалось загрузить фото
        thunkAPI.dispatch(setError('В часть карточек не добавились фото.'));
        return thunkAPI.fulfillWithValue(failedSkus);
      } else {
        thunkAPI.dispatch(
          setNotification('Фото успешно обновлены для всех артикулов.')
        );
        return [];
      }
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const systemSlice = createSlice({
  name: 'system',
  initialState: initialState,
  reducers: {
    clearFailedSkus: (state) => {
      state.failedSkus = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(uploadPhoto.fulfilled, (state, action) => {
      state.isLoading = false;
      state.failedSkus = action.payload || [];
    });
    builder.addCase(uploadPhoto.pending, (state) => {
      state.isLoading = true;
      state.failedSkus = [];
    });
    builder.addCase(uploadPhoto.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export const { clearFailedSkus } = systemSlice.actions;
export const selectFailedSkus = (state) => state.system.failedSkus;
export const selectIsLoading = (state) => state.system.isLoading;

export default systemSlice.reducer;
