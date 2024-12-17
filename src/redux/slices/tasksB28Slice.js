import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import createTasksB28List from '../../utils/createTasksB28List';
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

export const fetchTasksB28 = createAsyncThunk(
  'tasksB28/fetchTasksB28',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const fetchTaskB28ById = createAsyncThunk(
  'tasksDrain/fetchTaskB28ById',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const editTaskB28 = createAsyncThunk(
  'tasksDrain/editTaskB28',
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
  'tasksB28/fetchSkuData',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const createTaskB28 = createAsyncThunk(
  'tasksB28/createTaskB28',
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
  'tasksB28/goLiveTask',
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
  'tasksB28/stopTask',
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
  'tasksB28/setTaskToSkus',
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
  'tasksB28/unsetTaskToSkus',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, data);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

const tasksB28Slice = createSlice({
  name: 'tasksB28',
  initialState: initialState,
  reducers: {
    setDeleted: (state) => {
      state.isDeleted = !state.isDeleted;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTaskB28ById.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.taskSingle = createTaskSingle(action.payload);
        state.isDeleted = false;
      }
    });
    builder.addCase(fetchTaskB28ById.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchTasksB28.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.tasksData = createTasksB28List(action.payload);
        state.isDeleted = false;
      }
    });
    builder.addCase(fetchTasksB28.pending, (state) => {
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

export const selectTasksB28 = (state) => state.tasksB28.tasksData;
export const selectSkuData = (state) => state.tasksB28.skuData;
export const selectIsLoading = (state) => state.tasksB28.isLoading;
export const selectIsDeleted = (state) => state.tasksB28.isDeleted;
export const selectTaskSingle = (state) => state.tasksB28.taskSingle;

export default tasksB28Slice.reducer;
