import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import api from '../../utils/host';
import { setError } from './errorSlice';
import {
  createItemsList,
  createOrdersList,
} from '../../utils/createUpcomigsLists';
import { setNotification } from './notificationSlice';

import { clearCredentials } from './authSlice';

const initialState = {
  upcomingItems: [],
  upcomingOrders: [],
  filters: {
    categories: [],
    patterns: [],
    sorting: 'От старых к новым',
  },
  filtersOrders: {
    categories: [],
    patterns: [],
    sorting: 'От старых к новым',
  },
  isLoading: false,
};

export const fetchItems = createAsyncThunk(
  'upcoming/fetchItems',
  async (url, thunkAPI) => {
    try {
      const res = await api.get(url);
      return res.data;
    } catch (error) {
      if (error.request.status == 401) {
        thunkAPI.dispatch(clearCredentials());
        thunkAPI.dispatch(setError('Повторите вход!'));
      } else {
        thunkAPI.dispatch(setError('Ошибка на сервере'));
      }
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'upcoming/fetchOrders',
  async (url, thunkAPI) => {
    try {
      const res = await api.get(url);
      return res.data;
    } catch (error) {
      if (error.request.status == 401) {
        thunkAPI.dispatch(clearCredentials());
        thunkAPI.dispatch(setError('Повторите вход!'));
      } else {
        thunkAPI.dispatch(setError('Ошибка на сервере'));
      }
    }
  }
);

export const createOrders = createAsyncThunk(
  'upcoming/createOrders',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await api.post(url, data);
      thunkAPI.dispatch(setNotification('Заказ создан!'));
      return res.data;
    } catch (error) {
      if (error.request.status == 401) {
        thunkAPI.dispatch(clearCredentials());
        thunkAPI.dispatch(setError('Повторите вход!'));
      } else {
        thunkAPI.dispatch(setError('Ошибка на сервере'));
      }
    }
  }
);

export const updatePatterns = createAsyncThunk(
  'upcoming/updatePatterns',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await api.post(url, data);
      thunkAPI.dispatch(setNotification('Лекала обновлены!'));
      return res.data;
    } catch (error) {
      if (error.request.status == 401) {
        thunkAPI.dispatch(clearCredentials());
        thunkAPI.dispatch(setError('Повторите вход!'));
      } else {
        thunkAPI.dispatch(setError('Ошибка на сервере'));
      }
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'upcoming/deleteOrder',
  async ({ data, url }, thunkAPI) => {
    try {
      const res = await api.post(url, data);
      thunkAPI.dispatch(setNotification('Заказ удален!'));
      return res.data;
    } catch (error) {
      if (error.request.status == 401) {
        thunkAPI.dispatch(clearCredentials());
        thunkAPI.dispatch(setError('Повторите вход!'));
      } else {
        thunkAPI.dispatch(setError('Ошибка на сервере'));
      }
    }
  }
);

const upcomingSlice = createSlice({
  name: 'upcoming',
  initialState: initialState,
  reducers: {
    setFilterCategory: (state, action) => {
      state.filters.categories = [...action.payload];
    },
    resetFilterCategory: (state) => {
      state.filters.categories = [];
    },
    setFilterPattern: (state, action) => {
      state.filters.patterns = [...action.payload];
    },
    resetFilterPattern: (state) => {
      state.filters.patterns = [];
    },
    setSortingType: (state, action) => {
      state.filters.sorting = action.payload;
    },
    resetSortingType: (state) => {
      state.filters.sorting = 'От старых к новым';
    },
    setOrdersFilterCategory: (state, action) => {
      state.filtersOrders.categories = [...action.payload];
    },
    resetOrdersFilterCategory: (state) => {
      state.filtersOrders.categories = [];
    },
    setOrdersFilterPattern: (state, action) => {
      state.filtersOrders.patterns = [...action.payload];
    },
    resetOrdersFilterPattern: (state) => {
      state.filtersOrders.patterns = [];
    },
    setOrdersSortingType: (state, action) => {
      state.filtersOrders.sorting = action.payload;
    },
    resetOrdersSortingType: (state) => {
      state.filtersOrders.sorting = 'От старых к новым';
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.upcomingOrders = createOrdersList(action.payload);
      }
    });
    builder.addCase(fetchOrders.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchItems.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.upcomingItems = createItemsList(action.payload);
      }
    });
    builder.addCase(fetchItems.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(createOrders.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.upcomingItems = createItemsList(action.payload.items);
        state.upcomingOrders = createOrdersList(action.payload.orders);
      }
    });
    builder.addCase(createOrders.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(updatePatterns.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.upcomingItems = createItemsList(action.payload.items);
        state.upcomingOrders = createOrdersList(action.payload.orders);
      }
    });
    builder.addCase(updatePatterns.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(deleteOrder.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.upcomingItems = createItemsList(action.payload.items);
        state.upcomingOrders = createOrdersList(action.payload.orders);
      }
    });
    builder.addCase(deleteOrder.pending, (state) => {
      state.isLoading = true;
    });
  },
});

export const {
  setFilterCategory,
  resetFilterCategory,
  setSortingType,
  resetSortingType,
  setFilterPattern,
  resetFilterPattern,
  setOrdersFilterCategory,
  resetOrdersFilterCategory,
  setOrdersSortingType,
  resetOrdersSortingType,
  setOrdersFilterPattern,
  resetOrdersFilterPattern,
} = upcomingSlice.actions;

export const selectItems = (state) => state.upcoming.upcomingItems;
export const selectOrders = (state) => state.upcoming.upcomingOrders;
export const selectIsLoading = (state) => state.upcoming.isLoading;
export const selectUpcomingCategoryFilter = (state) =>
  state.upcoming.filters.categories;
export const selectUpcomingPatternFilter = (state) =>
  state.upcoming.filters.patterns;
export const selectUpcomingSortingType = (state) =>
  state.upcoming.filters.sorting;
export const selectOrdersCategoryFilter = (state) =>
  state.upcoming.filtersOrders.categories;
export const selectOrdersPatternFilter = (state) =>
  state.upcoming.filtersOrders.patterns;
export const selectOrdersSortingType = (state) =>
  state.upcoming.filtersOrders.sorting;

export default upcomingSlice.reducer;
