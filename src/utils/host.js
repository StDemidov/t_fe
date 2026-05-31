import axios from 'axios';
import { store } from '../redux/store';
import { clearCredentials } from '../redux/slices/authSlice';

export const hostName = 'https://t-prjct.ru';
// export const hostName = 'http://localhost:8000';

const api = axios.create({
  baseURL: hostName, // твой бекенд
});

// перехватчик добавляет токен во все запросы
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.user?.token; // токен из Redux
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      store.dispatch(clearCredentials());
      store.dispatch(setError('Повторите вход!'));
    }

    if (status === 403) {
      window.location.href = '/forbidden'; // или твой нужный путь
    }

    return Promise.reject(error);
  }
);

export default api;
