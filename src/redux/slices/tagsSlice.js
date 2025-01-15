import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import createTagsList from '../../utils/createTagsList';
import { setError } from './errorSlice';

const initialState = { tagsData: [], isLoading: false };

export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

const tagsSlice = createSlice({
  name: 'tags',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTags.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.tagsData = createTagsList(action.payload);
      }
    });
    builder.addCase(fetchTags.pending, (state) => {
      state.isLoading = true;
    });
  },
});

export const selectTags = (state) => state.tags.tagsData;
export const selectIsLoading = (state) => state.tags.isLoading;

export default tagsSlice.reducer;
