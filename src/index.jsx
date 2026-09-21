import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import { store } from './redux/store';
import App from './App';
import './tokens/colors.css';

// После деплоя новой сборки Vite меняет хеши в именах чанков. Если у пользователя
// остался старый бандл, ленивый import() запросит уже несуществующий файл, и
// сервер вернёт index.html (ошибка MIME для module script). В этом случае один
// раз перезагружаем страницу, чтобы подтянуть актуальную сборку. Метка в
// sessionStorage защищает от бесконечного цикла перезагрузок.
const PRELOAD_ERROR_KEY = 'vite:preloadErrorAt';
window.addEventListener('vite:preloadError', () => {
  const last = Number(sessionStorage.getItem(PRELOAD_ERROR_KEY) || 0);
  if (Date.now() - last < 10000) return;
  sessionStorage.setItem(PRELOAD_ERROR_KEY, String(Date.now()));
  window.location.reload();
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
