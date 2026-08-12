import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProductCards as fetchProductCardsApi } from '../api';
import { setError } from '../../../redux/slices/errorSlice';

export const fetchProductCards = createAsyncThunk(
  'productCards/fetch',
  async (_, thunkAPI) => {
    try {
      return await fetchProductCardsApi();
    } catch (error) {
      thunkAPI.dispatch(setError(error.message || 'Не удалось загрузить карточки'));
      throw error;
    }
  }
);

const initialState = {
  /** Список групп: [{ id, skus }], id = imtID, группа -1 — «свободные товары» */
  cards: [],
  isLoading: false,
  error: null,
};

const productCardsSlice = createSlice({
  name: 'productCards',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductCards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductCards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cards = action.payload;
      })
      .addCase(fetchProductCards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Не удалось загрузить карточки';
      });
  },
});

export default productCardsSlice.reducer;
