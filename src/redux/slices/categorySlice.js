import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import createCategoriesList from '../../utils/createCategoriesList';
import { setError } from './errorSlice';

const initialState = { categoriesData: [], isLoading: false };

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.categoriesData = createCategoriesList(action.payload);
      }
    });
    builder.addCase(fetchCategories.pending, (state) => {
      state.isLoading = true;
    });
  },
});

export const selectCategories = (state) => state.category.categoriesData;
export const selectIsLoading = (state) => state.category.isLoading;

export default categorySlice.reducer;
