import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import createTasksHoldStocksList from '../../utils/createTasksHoldStocksList';
import createTaskSingle from '../../utils/createTaskSingle';
import createSkuDataForTasksHoldStocks from '../../utils/createSkuDataForTasksHoldStocks';
import { setError } from './errorSlice';
import { setNotification } from './notificationSlice';

const initialState = {
  tasksData: [],
  skuData: [],
  isLoading: false,
  isDeleted: false,
  taskSingle: {},
};

export const fetchTasksHoldStocks = createAsyncThunk(
  'tasksHoldStocks/fetchTasksHoldStocks',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const fetchTaskHoldStocksById = createAsyncThunk(
  'tasksHoldStocks/fetchTaskHoldStocksById',
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
  'tasksHoldStocks/fetchSkuData',
  async (url, thunkAPI) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const createTaskHoldStocks = createAsyncThunk(
  'tasksHoldStocks/createTaskHoldStocks',
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

export const editTaskHoldStocks = createAsyncThunk(
  'tasksHoldStocks/editTaskHoldStocks',
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
  'tasksHoldStocks/deleteTask',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.delete(url, { data: data });
      thunkAPI.dispatch(setNotification('Задача успешно удалена!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const goLiveTask = createAsyncThunk(
  'tasksHoldStocks/goLiveTask',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, data);
      thunkAPI.dispatch(setNotification('Задача запущена!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const stopTask = createAsyncThunk(
  'tasksHoldStocks/stopTask',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, data);
      thunkAPI.dispatch(setNotification('Задача остановлена!'));
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const setTaskToSkus = createAsyncThunk(
  'tasksHoldStocks/setTaskToSkus',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, data);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

export const unsetTaskToSkus = createAsyncThunk(
  'tasksHoldStocks/unsetTaskToSkus',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await axios.post(url, data);
      return res.data;
    } catch (error) {
      thunkAPI.dispatch(setError(error.message));
    }
  }
);

const tasksHoldStocksSlice = createSlice({
  name: 'tasksHoldStocks',
  initialState: initialState,
  reducers: {
    setDeleted: (state) => {
      state.isDeleted = !state.isDeleted;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTasksHoldStocks.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.tasksData = createTasksHoldStocksList(action.payload);
        state.isDeleted = false;
      }
    });
    builder.addCase(fetchTasksHoldStocks.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchTaskHoldStocksById.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.taskSingle = createTaskSingle(action.payload);
        state.isDeleted = false;
      }
    });
    builder.addCase(fetchTaskHoldStocksById.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchSkuData.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.skuData = createSkuDataForTasksHoldStocks(action.payload);
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

export const selectTasksHold = (state) => state.tasksHoldStocks.tasksData;
export const selectSkuDataHold = (state) => state.tasksHoldStocks.skuData;
export const selectIsLoading = (state) => state.tasksHoldStocks.isLoading;
export const selectIsDeleted = (state) => state.tasksHoldStocks.isDeleted;
export const selectTaskSingle = (state) => state.tasksHoldStocks.taskSingle;

export default tasksHoldStocksSlice.reducer;
