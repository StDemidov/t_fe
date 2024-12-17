import { configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import categoryReducer from './slices/categorySlice';
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

import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from '@reduxjs/toolkit';

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user'], // Сохраняйте только нужные данные из state.auth
};

const authReducer = persistReducer(authPersistConfig, userReducer);

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
  auth: authReducer, // Обернули auth
  ebitdaSettings: ebitdaSettingsReducer,
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
