import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchWorkingPromo as fetchWorkingApi,
  fetchFinishedPromo as fetchFinishedApi,
  fetchPendingPromo as fetchPendingApi,
  startPromo as startPromoApi,
  pausePromo as pausePromoApi,
  finishPromo as finishPromoApi,
  deletePromo as deletePromoApi,
} from '../api';
import { mapPromo } from '../utils/promoDataMapper';
import { setError } from '../../../redux/slices/errorSlice';

/** Новый статус кампании после успешного действия. */
export const RESULT_STATUS = {
  start: 29,
  pause: 211,
  finish: 212,
  delete: 213,
};

/** API-функции действий по ключу. */
const ACTION_API = {
  start: startPromoApi,
  pause: pausePromoApi,
  finish: finishPromoApi,
  delete: deletePromoApi,
};

/**
 * Действие над одной или несколькими кампаниями (запуск / пауза /
 * завершение / удаление). Все действия работают со списком id.
 *
 * Оптимистично меняет статус кампаний прямо в разделе, из которого пришёл
 * вызов: пауза → 211, запуск → 29, завершение → 212, удаление → 213.
 * Удалённые кампании убираются из раздела, кроме «В обработке», где строка
 * остаётся со статусом 213. При ошибке изменения откатываются.
 *
 * @param {{ action: 'start'|'pause'|'finish'|'delete', status: string, ids: Array<number> }} arg
 */
export const promoAction = createAsyncThunk(
  'promo/promoAction',
  async ({ action, status, ids }, thunkAPI) => {
    const apiFn = ACTION_API[action];
    if (!apiFn) throw new Error(`Неизвестное действие РК: ${action}`);

    try {
      const data = await apiFn(ids);
      return { action, status, ids, data };
    } catch (error) {
      thunkAPI.dispatch(
        setError(error.message || 'Не удалось выполнить действие с кампаниями')
      );
      throw error;
    }
  }
);

/**
 * Загрузка рекламных кампаний раздела. «Активные» и «Завершенные»
 * запрашиваются с диапазоном дат, «В обработке» — без параметров.
 * Нормализация общая (mapPromo), различия только в заполненных полях.
 *
 * @param {{ status: string, startDate?: string, endDate?: string }} arg
 */
export const fetchPromo = createAsyncThunk(
  'promo/fetchPromo',
  async ({ status, startDate, endDate }, thunkAPI) => {
    const loaders = {
      active: () => fetchWorkingApi({ startDate, endDate }),
      finished: () => fetchFinishedApi({ startDate, endDate }),
      pending: () => fetchPendingApi(),
    };
    const loader = loaders[status];
    if (!loader) throw new Error(`Неизвестный раздел рекламы: ${status}`);

    try {
      const payload = await loader();
      return {
        status,
        items: (payload || []).map(mapPromo),
        startDate,
        endDate,
      };
    } catch (error) {
      thunkAPI.dispatch(
        setError(error.message || 'Не удалось загрузить рекламные кампании')
      );
      throw error;
    }
  }
);

const initialState = {
  /** Списки кампаний по разделам: { active, finished, pending } */
  active: { items: [], isLoading: false, error: null, isLoaded: false, range: null },
  finished: { items: [], isLoading: false, error: null, isLoaded: false, range: null },
  pending: { items: [], isLoading: false, error: null, isLoaded: false, range: null },
};

const promoSlice = createSlice({
  name: 'promoPage',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // addCase регистрируется один раз на action, поэтому раздел определяем
    // внутри редьюсера — загрузка вкладки не трогает остальные слоты.
    builder
      .addCase(fetchPromo.pending, (state, action) => {
        const slot = state[action.meta.arg.status];
        if (!slot) return;
        slot.isLoading = true;
        slot.error = null;
      })
      .addCase(fetchPromo.fulfilled, (state, action) => {
        const { status, items, startDate, endDate } = action.payload;
        if (!state[status]) return;
        state[status].isLoading = false;
        state[status].items = items;
        state[status].isLoaded = true;
        // Диапазон, за который загружены данные — чтобы при возврате
        // на вкладку не перезапрашивать с теми же датами.
        state[status].range = startDate ? { startDate, endDate } : null;
      })
      .addCase(fetchPromo.rejected, (state, action) => {
        const slot = state[action.meta.arg.status];
        if (!slot) return;
        slot.isLoading = false;
        slot.error =
          action.error.message || 'Не удалось загрузить рекламные кампании';
      })
      // Действия над кампаниями: оптимистично меняем статус в разделе,
      // из которого пришёл вызов, и убираем удалённые из списка.
      .addCase(promoAction.pending, (state, action) => {
        const { action: kind, status, ids } = action.meta.arg;
        const slot = state[status];
        if (!slot) return;

        const idsSet = new Set(ids);
        const resultStatus = RESULT_STATUS[kind];
        // Снимок для отката: какие строки и на каких позициях меняем.
        const removed = [];
        const changed = [];

        slot.items = slot.items.filter((item, index) => {
          if (!idsSet.has(item.id)) return true;
          if (kind === 'delete') {
            if (status === 'pending') {
              changed.push({ item, status: item.status });
              item.status = RESULT_STATUS.delete;
              return true;
            }
            removed.push({ index, item });
            return false;
          }
          item.status = resultStatus;
          return true;
        });

        action.meta.snapshot = { status, removed, changed };
      })
      .addCase(promoAction.rejected, (state, action) => {
        const snapshot = action.meta.snapshot;
        // Состояние могло измениться/раздел — перезагрузиться: безопасно
        // откатываем удаление и изменения статуса.
        if (!snapshot?.removed?.length && !snapshot?.changed?.length) return;
        const slot = state[snapshot.status];
        if (!slot) return;
        const next = [...slot.items];
        for (const { index, item } of snapshot.removed) {
          next.splice(Math.min(index, next.length), 0, item);
        }
        for (const changed of snapshot.changed || []) {
          changed.item.status = changed.status;
        }
        slot.items = next;
      });
  },
});

export default promoSlice.reducer;
