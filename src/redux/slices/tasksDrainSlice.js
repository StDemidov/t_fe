import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import createTasksDrainList from '../../utils/createTasksDrainList';
import createTaskSingle from '../../utils/createTaskSingle';
import createSkuDataForTasksDrain from '../../utils/createSkuDataForTasksDrain';
import { setError } from './errorSlice';
import { setNotification } from './notificationSlice';

const initialState = {
  tasksData: [],
  skuData: [],
  isLoading: false,
  isDeleted: false,
  taskSingle: {},
};

export const fetchTasksDrain = createAsyncThunk(
  'tasksDrain/fetchTasksDrain',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const fetchTaskDrainById = createAsyncThunk(
  'tasksDrain/fetchTaskDrainById',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const fetchSkuData = createAsyncThunk(
  'tasksDrain/fetchSkuData',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const createTaskDrain = createAsyncThunk(
  'tasksDrain/createTaskDrain',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, data);
      thunkAPI.dispatch(setNotification('Задача успешно создана!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const editTaskDrain = createAsyncThunk(
  'tasksDrain/editTaskDrain',
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

export const deleteTask = createAsyncThunk(
  'tasksDrain/deleteTask',
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
  'tasksDrain/goLiveTask',
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
  'tasksDrain/stopTask',
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
  'tasksDrain/setTaskToSkus',
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
  'tasksDrain/unsetTaskToSkus',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, data);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

const tasksDrainSlice = createSlice({
  name: 'tasksDrain',
  initialState: initialState,
  reducers: {
    setDeleted: (state) => {
      state.isDeleted = !state.isDeleted;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTasksDrain.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.tasksData = createTasksDrainList(action.payload);
        state.isDeleted = false;
      }
    });
    builder.addCase(fetchTasksDrain.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchTaskDrainById.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.taskSingle = createTaskSingle(action.payload);
        state.isDeleted = false;
      }
    });
    builder.addCase(fetchTaskDrainById.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchSkuData.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.skuData = createSkuDataForTasksDrain(action.payload);
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

export const selectTasksDrain = (state) => state.tasksDrain.tasksData;
export const selectSkuDataDrain = (state) => state.tasksDrain.skuData;
export const selectIsLoading = (state) => state.tasksDrain.isLoading;
export const selectIsDeleted = (state) => state.tasksDrain.isDeleted;
export const selectTaskSingle = (state) => state.tasksDrain.taskSingle;

export default tasksDrainSlice.reducer;
