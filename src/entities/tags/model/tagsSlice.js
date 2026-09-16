import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTags as fetchTagsApi } from '../api';
import { setError } from '../../../redux/slices/errorSlice';

export const fetchTags = createAsyncThunk('tags/fetch', async (_, thunkAPI) => {
  try {
    return await fetchTagsApi();
  } catch (error) {
    thunkAPI.dispatch(setError(error.message || 'Не удалось загрузить теги'));
    throw error;
  }
});

const initialState = {
  /** Теги категории «основные» (mainTags) */
  main: [],
  /** Теги категории «ткань» (clothTags) */
  cloth: [],
  /** Теги категории «дополнительные» (otherTags) */
  others: [],
  isLoading: false,
  error: null,
};

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    /**
     * Убирает удалённые теги из общего пула.
     * @param {Array<{ tag_name: string, type: string }>} action.payload —
     *   успешно удалённые теги.
     */
    removeTagsFromPool(state, action) {
      const removed = action.payload || [];
      const byType = { main: [], cloth: [], others: [] };
      removed.forEach(({ tag_name, type }) => {
        if (byType[type]) byType[type].push(String(tag_name));
      });
      state.main = state.main.filter((t) => !byType.main.includes(String(t)));
      state.cloth = state.cloth.filter((t) => !byType.cloth.includes(String(t)));
      state.others = state.others.filter((t) => !byType.others.includes(String(t)));
    },
    /**
     * Добавляет созданные теги в общий пул (без дубликатов).
     * @param {Array<{ tag_name: string, type: string }>} action.payload —
     *   успешно созданные теги.
     */
    addTagsToPool(state, action) {
      const added = action.payload || [];
      const pushUnique = (list, name) => {
        if (!name || list.includes(String(name))) return;
        list.push(String(name));
      };
      added.forEach(({ tag_name, type }) => {
        if (type === 'main') pushUnique(state.main, tag_name);
        else if (type === 'cloth') pushUnique(state.cloth, tag_name);
        else if (type === 'others') pushUnique(state.others, tag_name);
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.isLoading = false;
        state.main = action.payload.mainTags || [];
        state.cloth = action.payload.clothTags || [];
        state.others = action.payload.otherTags || [];
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Не удалось загрузить теги';
      });
  },
});

export default tagsSlice.reducer;

export const { removeTagsFromPool, addTagsToPool } = tagsSlice.actions;
