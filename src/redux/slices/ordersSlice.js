import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: {},
  colors: {},
  ordersDates: {},
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState: initialState,
  reducers: {
    saveOrders: (state, action) => {
      state.orders = action.payload;
    },
    deleteOrders: (state) => {
      state.orders = {};
    },
    saveColors: (state, action) => {
      state.colors = action.payload;
    },
    deleteColors: (state) => {
      state.colors = {};
    },
    saveOrdersDates: (state, action) => {
      state.ordersDates = action.payload;
    },
    deleteOrdersDates: (state) => {
      state.ordersDates = {};
    },
  },
});

export const selectOrders = (state) => state.orders.orders;
export const selectOrdersDates = (state) => state.orders.ordersDates;
export const selectColors = (state) => state.orders.colors;

export const {
  saveOrders,
  deleteOrders,
  saveOrdersDates,
  deleteOrdersDates,
  saveColors,
  deleteColors,
} = ordersSlice.actions;

export default ordersSlice.reducer;
