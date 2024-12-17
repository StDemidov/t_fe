import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import createTasksA28List from '../../utils/createTasksA28List';
import createSkuDataForTasks from '../../utils/createSkuDataForTasks';
import createTaskSingle from '../../utils/createTaskSingle';
import { setError } from './errorSlice';
import { setNotification } from './notificationSlice';

const initialState = {
  tasksData: [],
  skuData: [],
  isLoading: false,
  isDeleted: false,
  taskSingle: {},
};

export const fetchTasksA28 = createAsyncThunk(
  'tasksA28/fetchTasksA28',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const fetchTaskA28ById = createAsyncThunk(
  'tasksDrain/fetchTaskA28ById',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const editTaskA28 = createAsyncThunk(
  'tasksDrain/editTaskA28',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.patch(url, data);
      thunkAPI.dispatch(setNotification('Задача успешно изменена!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const fetchSkuData = createAsyncThunk(
  'tasksA28/fetchSkuData',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const createTaskA28 = createAsyncThunk(
  'tasksA28/createTaskA28',
  async ({ data, url }, thunkAPI) => {
    try {
      console.log(data);
      const res = await axios.post(url, data);
      thunkAPI.dispatch(setNotification('Задача успешно создана!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasksB2/deleteTask',
  async ({ data, url }, thunkAPI) => {
    try {
      console.log(data);
      const res = await axios.delete(url, { data: data });
      thunkAPI.dispatch(setNotification('Задача успешно удалена!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const goLiveTask = createAsyncThunk(
  'tasksA28/goLiveTask',
  async ({ data, url }, thunkAPI) => {
    try {
      console.log(data);
      const res = await axios.post(url, data);
      thunkAPI.dispatch(setNotification('Задача запущена!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const stopTask = createAsyncThunk(
  'tasksA28/stopTask',
  async ({ data, url }, thunkAPI) => {
    try {
      console.log(data);
      const res = await axios.post(url, data);
      thunkAPI.dispatch(setNotification('Задача остановлена!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const setTaskToSkus = createAsyncThunk(
  'tasksA28/setTaskToSkus',
  async ({ data, url }, thunkAPI) => {
    try {
      console.log(data);
      const res = await axios.post(url, data);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const unsetTaskToSkus = createAsyncThunk(
  'tasksA28/unsetTaskToSkus',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, data);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

const tasksA28Slice = createSlice({
  name: 'tasksA28',
  initialState: initialState,
  reducers: {
    setDeleted: (state) => {
      state.isDeleted = !state.isDeleted;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTaskA28ById.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.taskSingle = createTaskSingle(action.payload);
        state.isDeleted = false;
      }
    });
    builder.addCase(fetchTaskA28ById.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchTasksA28.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.tasksData = createTasksA28List(action.payload);
        state.isDeleted = false;
      }
    });
    builder.addCase(fetchTasksA28.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchSkuData.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.skuData = createSkuDataForTasks(action.payload);
        state.isDeleted = false;
      }
    });
    builder.addCase(fetchSkuData.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(goLiveTask.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.isDeleted = false;
      }
    });
    builder.addCase(goLiveTask.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(stopTask.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.isDeleted = false;
      }
    });
    builder.addCase(stopTask.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(setTaskToSkus.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.isDeleted = false;
      }
    });
    builder.addCase(setTaskToSkus.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(unsetTaskToSkus.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.isDeleted = false;
      }
    });
    builder.addCase(unsetTaskToSkus.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(deleteTask.fulfilled, (state) => {
      state.isLoading = false;
      state.isDeleted = true;
    });
    builder.addCase(deleteTask.pending, (state) => {
      state.isLoading = true;
    });
  },
});

export const selectTasksA28 = (state) => state.tasksA28.tasksData;
export const selectSkuData = (state) => state.tasksA28.skuData;
export const selectIsLoading = (state) => state.tasksA28.isLoading;
export const selectIsDeleted = (state) => state.tasksA28.isDeleted;
export const selectTaskSingle = (state) => state.tasksA28.taskSingle;

export default tasksA28Slice.reducer;
