import { configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import categoryReducer from './slices/categorySlice';
import categoriesMetricsReducer from './slices/categoriesMetricsSlice';
import errorReducer from './slices/errorSlice';
import notificationReducer from './slices/notificationSlice';
import barcodeReducer from './slices/barcodeSlice';
import filterReducer from './slices/filterSlice';
import vendorCodeReducer from './slices/vendorCodeSlice';
import tasksB28Reducer from './slices/tasksB28Slice';
import tasksA28Reducer from './slices/tasksA28Slice';
import abcReducer from './slices/abcSlice';
import tasksDrainReducer from './slices/tasksDrainSlice';
import userReducer from './slices/authSlice';
import ebitdaSettingsReducer from './slices/ebitdaSettingsSlice';
import autoCampaignsReducer from './slices/autoCampaignsSlice';
import aucCampaignsReducer from './slices/aucCampaignsSlice';
import tasksHoldStocksReducer from './slices/tasksHoldStocksSlice';
import ordersReducer from './slices/ordersSlice';
import systemReducer from './slices/systemSlice';
import abTestReducer from './slices/abTestsSlice';
import campaignsReducer from './slices/campaignsSlice';
import upcomingReducer from './slices/basePrints';
import regorupReducer from './slices/regroupSlice';
import mainDashboardReducer from './slices/mainDashboardSlice';
import inventoryReducer from '../components/inventory/redux/inventorySlice';
import inventoryFilterReducer from '../components/inventory/redux/inventoryFilterSlice';

import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from '@reduxjs/toolkit';

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user'],
};

const ordersPersistConfig = {
  key: 'orders',
  storage,
  whitelist: ['orders', 'colors', 'ordersDates'],
};

const inventoryPersistConfig = {
  key: 'inventory',
  storage,
  // Only persist user inputs — NOT skuList/ordersMap (too large, causes QuotaExceededError)
  // Server data is re-fetched on mount via fetchInventory
  whitelist: ['extraStock', 'startCalcDates'],
};

const inventoryFilterPersistConfig = {
  key: 'inventoryFilter',
  storage,
  whitelist: [
    'dateRange',
    'sortingType',
    'vcNameQuery',
    'categories',
    'tagsMain',
    'tagsCloth',
    'tagsOthers',
    'patterns',
    'orderNames',
    'ganttDeadline',
  ],
};

const authReducer = persistReducer(authPersistConfig, userReducer);
const orderBCReducer = persistReducer(ordersPersistConfig, ordersReducer);
const persistedInventoryReducer = persistReducer(inventoryPersistConfig, inventoryReducer);
const persistedInventoryFilterReducer = persistReducer(inventoryFilterPersistConfig, inventoryFilterReducer);

const rootReducer = combineReducers({
  category: categoryReducer,
  error: errorReducer,
  notification: notificationReducer,
  barcode: barcodeReducer,
  filter: filterReducer,
  vendorCode: vendorCodeReducer,
  tasksB28: tasksB28Reducer,
  tasksA28: tasksA28Reducer,
  abc: abcReducer,
  tasksDrain: tasksDrainReducer,
  auth: authReducer,
  orders: orderBCReducer,
  ebitdaSettings: ebitdaSettingsReducer,
  autoCampaigns: autoCampaignsReducer,
  tasksHoldStocks: tasksHoldStocksReducer,
  aucCampaigns: aucCampaignsReducer,
  categoriesMetrics: categoriesMetricsReducer,
  system: systemReducer,
  abTests: abTestReducer,
  campaigns: campaignsReducer,
  upcoming: upcomingReducer,
  regroup: regorupReducer,
  mainDashboard: mainDashboardReducer,
  inventory: persistedInventoryReducer,
  inventoryFilter: persistedInventoryFilterReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

const persistor = persistStore(store);

export { store, persistor };
