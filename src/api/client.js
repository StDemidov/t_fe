/**
 * HTTP-клиент для новых фич.
 * Старый код продолжает использовать utils/host.js — миграция постепенная.
 */
import axios from 'axios';
import { store } from '../redux/store';
import { clearCredentials } from '../redux/slices/authSlice';
import { setError } from '../redux/slices/errorSlice';

import { hostName } from '../utils/host';

export { hostName };

const client = axios.create({
  baseURL: hostName,
});

client.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.user?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      store.dispatch(clearCredentials());
      store.dispatch(setError('Повторите вход!'));
    }

    if (status === 403) {
      window.location.href = '/forbidden';
    }

    return Promise.reject(error);
  }
);

export default client;
