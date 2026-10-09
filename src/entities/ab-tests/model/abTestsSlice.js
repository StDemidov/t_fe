import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchActiveAbTests as fetchActiveApi,
  fetchFinishedAbTests as fetchFinishedApi,
  fetchPendingAbTests as fetchPendingApi,
  deleteAbTestRequest,
  pauseAbTestRequest,
  startAbTestRequest,
  finishAbTestRequest,
} from '../api';
import { mapAbTest } from '../utils/abTestsDataMapper';
import { setError } from '../../../redux/slices/errorSlice';
import { setNotification } from '../../../redux/slices/notificationSlice';

/**
 * Загрузка тестов раздела. Все три эндпоинта отдают список тестов,
 * нормализация — общая (mapAbTest), различия только в заполненных полях.
 */
export const fetchAbTests = createAsyncThunk(
  'abTests/fetchAbTests',
  async ({ status }, thunkAPI) => {
    const loaders = {
      active: fetchActiveApi,
      finished: fetchFinishedApi,
      pending: fetchPendingApi,
    };
    const loader = loaders[status];
    if (!loader) throw new Error(`Неизвестный раздел тестов: ${status}`);

    try {
      const payload = await loader();
      return { status, items: (payload || []).map(mapAbTest) };
    } catch (error) {
      thunkAPI.dispatch(
        setError(error.message || 'Не удалось загрузить A/B тесты')
      );
      throw error;
    }
  }
);

/**
 * Удаление теста: DELETE /ab_tests/delete?id={id}.
 * Список обновляется оптимистично — тест убирается из выдачи на `pending`,
 * а при ошибке возвращается на прежнее место в `rejected`.
 *
 * @param {{ id: string|number, status: string, test: object }} arg
 */
export const deleteAbTest = createAsyncThunk(
  'abTests/deleteAbTest',
  async ({ id }, thunkAPI) => {
    try {
      await deleteAbTestRequest(id);
      thunkAPI.dispatch(setNotification('Тест удален.'));
      return { id };
    } catch (error) {
      thunkAPI.dispatch(
        setError(error.message || 'Не удалось удалить A/B тест')
      );
      throw error;
    }
  }
);

/**
 * Управляющие действия над активным тестом: пауза, запуск, завершение.
 * После ответа 200 в тесте меняется только статус — сам тест остаётся
 * в выдаче «Активных».
 *
 * @param {{ id: string|number }} arg
 */
export const pauseAbTest = createAsyncThunk(
  'abTests/pauseAbTest',
  async ({ id }, thunkAPI) => {
    try {
      await pauseAbTestRequest(id);
      thunkAPI.dispatch(setNotification('Тест поставлен на паузу.'));
      return { id, nextStatus: 211 };
    } catch (error) {
      thunkAPI.dispatch(
        setError(error.message || 'Не удалось поставить тест на паузу')
      );
      throw error;
    }
  }
);

/**
 * Запуск активного теста после паузы.
 * @param {{ id: string|number }} arg
 */
export const startAbTest = createAsyncThunk(
  'abTests/startAbTest',
  async ({ id }, thunkAPI) => {
    try {
      await startAbTestRequest(id);
      thunkAPI.dispatch(setNotification('Тест активирован.'));
      return { id, nextStatus: 29 };
    } catch (error) {
      thunkAPI.dispatch(
        setError(error.message || 'Не удалось активировать тест')
      );
      throw error;
    }
  }
);

/**
 * Завершение активного теста.
 * @param {{ id: string|number }} arg
 */
export const finishAbTest = createAsyncThunk(
  'abTests/finishAbTest',
  async ({ id }, thunkAPI) => {
    try {
      await finishAbTestRequest(id);
      thunkAPI.dispatch(setNotification('Тест завершен.'));
      return { id, nextStatus: 212 };
    } catch (error) {
      thunkAPI.dispatch(
        setError(error.message || 'Не удалось завершить тест')
      );
      throw error;
    }
  }
);

/**
 * После ответа 200 меняет у теста только статус.
 * Используется паузой, запуском и завершением активных тестов.
 */
const setTestStatus = (state, action) => {
  const { id, nextStatus } = action.payload;
  const slot = state.active;
  if (!slot) return;
  const target = slot.items.find((item) => String(item.id) === String(id));
  if (target) target.status = nextStatus;
};

const initialState = {
  /** Списки тестов по разделам: { active, finished, pending } */
  active: { items: [], isLoading: false, error: null, isLoaded: false, removedTests: [] },
  finished: { items: [], isLoading: false, error: null, isLoaded: false, removedTests: [] },
  pending: { items: [], isLoading: false, error: null, isLoaded: false, removedTests: [] },
};

const abTestsSlice = createSlice({
  name: 'abTestsPage',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // addCase регистрируется один раз на action, поэтому раздел определяем
    // внутри редьюсера — загрузка вкладки не трогает остальные слоты.
    builder
      .addCase(fetchAbTests.pending, (state, action) => {
        const slot = state[action.meta.arg.status];
        if (!slot) return;
        slot.isLoading = true;
        slot.error = null;
      })
      .addCase(fetchAbTests.fulfilled, (state, action) => {
        const { status, items } = action.payload;
        if (!state[status]) return;
        state[status].isLoading = false;
        state[status].items = items;
        // Раздел загружен — повторные переходы на вкладку не ходят в API.
        state[status].isLoaded = true;
      })
      .addCase(fetchAbTests.rejected, (state, action) => {
        const slot = state[action.meta.arg.status];
        if (!slot) return;
        slot.isLoading = false;
        slot.error = action.error.message || 'Не удалось загрузить A/B тесты';
      })

      // Оптимистичное удаление: тест убирается из выдачи до ответа бэкенда,
      // сам тест запоминается для отката. У «В обработке» другой сценарий:
      // тест остаётся в списке, а после ответа 200 его статус меняется на 213.
      .addCase(deleteAbTest.pending, (state, action) => {
        const { status, id, test } = action.meta.arg;
        if (status === 'pending') return;
        const slot = state[status];
        if (!slot) return;
        slot.items = slot.items.filter(
          (item) => String(item.id) !== String(id)
        );
        if (test)
          slot.removedTests = [
            ...slot.removedTests.filter(
              (item) => String(item.id) !== String(id)
            ),
            test,
          ];
      })
      // Ошибка удаления — возвращаем тест в конец списка раздела.
      .addCase(deleteAbTest.rejected, (state, action) => {
        if (action.meta.arg.status === 'pending') return;
        const { status, id } = action.meta.arg;
        const slot = state[status];
        if (!slot) return;
        const removed = slot.removedTests.filter(
          (item) => String(item.id) === String(id)
        )[0];
        slot.removedTests = slot.removedTests.filter(
          (item) => String(item.id) !== String(id)
        );
        if (!removed) return;
        if (!slot.items.some((item) => String(item.id) === String(removed.id)))
          slot.items = [...slot.items, removed];
      })
      // Тест удалён на сервере — откат больше не нужен.
      // Раздел «В обработке»: 200 → статус теста меняется на 213 («Ожидает
      // удаления»), сам тест остаётся в списке.
      .addCase(deleteAbTest.fulfilled, (state, action) => {
        if (action.meta.arg.status === 'pending') {
          const { id } = action.meta.arg;
          const pending = state.pending;
          if (!pending) return;
          const target = pending.items.find(
            (item) => String(item.id) === String(id)
          );
          if (target) target.status = 213;
          return;
        }
        const { id } = action.meta.arg;
        const slot = state[action.meta.arg.status];
        if (!slot) return;
        slot.removedTests = slot.removedTests.filter(
          (item) => String(item.id) !== String(id)
        );
      })

      // Пауза/запуск/завершение активного теста: после 200 у теста меняется
      // только статус на agreed — тест остаётся в списке «Активных».
      .addCase(pauseAbTest.fulfilled, (state, action) => {
        setTestStatus(state, action);
      })
      .addCase(startAbTest.fulfilled, (state, action) => {
        setTestStatus(state, action);
      })
      .addCase(finishAbTest.fulfilled, (state, action) => {
        setTestStatus(state, action);
      });
  },
});

export default abTestsSlice.reducer;