import axios from 'axios';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import createSKUListForAbTests from '../../utils/createSKUListForAbTests';
import { setError } from './errorSlice';
import { store } from '../store';
import api, { hostName } from '../../utils/host';
import { clearCredentials } from './authSlice';
import createABtestsLists from '../../utils/createABtestsLists';
import createABtestSingle from '../../utils/createABtestSingle';
import { setNotification } from './notificationSlice';

const initialState = {
  skuList: [],
  isLoading: false,
  settings: {
    statusSteps: [],
    finalSettings: null,
  },
  createProgress: {
    statusSteps: [],
    finalResult: null,
  },
  abTests: {
    completed: [],
    active: [],
    failed: [],
  },
  singleAbTests: {},
};

export const fetchABTests = createAsyncThunk(
  'abTests/fetchABTests',
  async (url, thunkAPI) => {
    try {
      const res = await api.get(url);
      return res.data;
    } catch (error) {
      if (error.request.status == 401) {
        thunkAPI.dispatch(clearCredentials());
        thunkAPI.dispatch(setError('Повторите вход!'));
      } else {
        thunkAPI.dispatch(setError(error.message));
      }
    }
  }
);

export const deleteABTest = createAsyncThunk(
  'abTests/deleteABTest',
  async (url, thunkAPI) => {
    try {
      const res = await api.delete(url);
      thunkAPI.dispatch(setNotification('Тест удален.'));
      return res.data;
    } catch (error) {
      if (error.request.status == 401) {
        thunkAPI.dispatch(clearCredentials());
        thunkAPI.dispatch(setError('Повторите вход!'));
      } else {
        thunkAPI.dispatch(setError(error.message));
      }
    }
  }
);

export const pauseABTest = createAsyncThunk(
  'abTests/pauseABTest',
  async (url, thunkAPI) => {
    try {
      const res = await api.get(url);
      thunkAPI.dispatch(setNotification('Тест приостановлен.'));
      return res.data;
    } catch (error) {
      if (error.request.status == 401) {
        thunkAPI.dispatch(clearCredentials());
        thunkAPI.dispatch(setError('Повторите вход!'));
      } else {
        thunkAPI.dispatch(setError(error.message));
      }
    }
  }
);

export const startABTest = createAsyncThunk(
  'abTests/startABTest',
  async (url, thunkAPI) => {
    try {
      const res = await api.get(url);
      thunkAPI.dispatch(setNotification('Тест запущен.'));
      return res.data;
    } catch (error) {
      if (error.request.status == 401) {
        thunkAPI.dispatch(clearCredentials());
        thunkAPI.dispatch(setError('Повторите вход!'));
      } else {
        thunkAPI.dispatch(setError(error.message));
      }
    }
  }
);

export const fetchSingleABTest = createAsyncThunk(
  'abTests/fetchSingleABTest',
  async (url, thunkAPI) => {
    try {
      const res = await api.get(url);
      return res.data;
    } catch (error) {
      if (error.request.status == 401) {
        thunkAPI.dispatch(clearCredentials());
        thunkAPI.dispatch(setError('Повторите вход!'));
      } else {
        thunkAPI.dispatch(setError(error.message));
      }
    }
  }
);

export const fetchSkuList = createAsyncThunk(
  'abTests/fetchSkuList',
  async (url, thunkAPI) => {
    try {
      const res = await api.get(url);
      return res.data;
    } catch (error) {
      if (error.request.status == 401) {
        thunkAPI.dispatch(clearCredentials());
        thunkAPI.dispatch(setError('Повторите вход!'));
      } else {
        thunkAPI.dispatch(setError(error.message));
      }
    }
  }
);

export const getImagesAndSettings = createAsyncThunk(
  'abTests/getImagesAndSettings',
  async (url, thunkAPI) => {
    const state = store.getState();
    const token = state.auth.user?.token; // токен из Redux
    return new Promise((resolve, reject) => {
      const es = new EventSource(`${url}?token=${token}`);

      es.addEventListener('progress', (e) => {
        const data = JSON.parse(e.data);
        thunkAPI.dispatch(setIntermediateStatusSettings(data)); // новый action для промежуточных шагов
      });

      es.addEventListener('done', (e) => {
        const data = JSON.parse(e.data);
        thunkAPI.dispatch(setFinalResultSettings(data));
        thunkAPI.dispatch(resetIntermediateStatusSettings());
        es.close();
        resolve(data);
      });
      es.addEventListener('error', (e) => {
        try {
          const data = JSON.parse(e.data);
          thunkAPI.dispatch(setErrorStep(data));
        } catch {
          thunkAPI.dispatch(
            setErrorStep({
              message: 'Неизвестная ошибка при получении настроек',
            })
          );
        }
        es.close();
        reject(new Error('SSE error'));
      });
    });
  }
);

export const restartABTest = createAsyncThunk(
  'abTests/restartABTest',
  async (url, thunkAPI) => {
    const state = store.getState();
    const token = state.auth.user?.token; // токен из Redux
    return new Promise((resolve, reject) => {
      const es = new EventSource(`${url}?token=${token}`);

      es.addEventListener('progress', (e) => {
        const data = JSON.parse(e.data);
        thunkAPI.dispatch(setIntermediateStatusCreating(data)); // новый action для промежуточных шагов
      });

      es.addEventListener('done', (e) => {
        const data = JSON.parse(e.data);
        thunkAPI.dispatch(setFinalResultCreating(data));
        thunkAPI.dispatch(resetIntermediateStatusCreating());
        es.close();
        resolve(data);
      });
      es.addEventListener('error', (e) => {
        try {
          const data = JSON.parse(e.data);
          thunkAPI.dispatch(setErrorStepCreating(data));
        } catch {
          thunkAPI.dispatch(
            setErrorStepCreating({
              message: 'Неизвестная ошибка при заведении теста',
            })
          );
        }
        es.close();
        reject(new Error('SSE error'));
      });
    });
  }
);

export const startTest = createAsyncThunk(
  'abTests/startTest',
  async ({ data, url }, thunkAPI) => {
    const state = store.getState();
    const token = state.auth.user?.token; // токен из Redux
    try {
      // шаг 1 — отправляем POST
      const response = await api.post(url, data);
      if (!response.data) {
        throw new Error('Ошибка запуска теста');
      }
      const { test_id } = await response.data;
      return new Promise((resolve, reject) => {
        const es = new EventSource(
          `${hostName}/sse/ab_tests/create/${test_id}?token=${token}`
        );

        es.addEventListener('progress', (e) => {
          const data = JSON.parse(e.data);
          thunkAPI.dispatch(setIntermediateStatusCreating(data)); // новый action для промежуточных шагов
        });

        es.addEventListener('done', (e) => {
          const data = JSON.parse(e.data);
          thunkAPI.dispatch(setFinalResultCreating(data));
          thunkAPI.dispatch(resetIntermediateStatusCreating());
          es.close();
          resolve(data);
        });
        es.addEventListener('error', (e) => {
          try {
            const data = JSON.parse(e.data);
            thunkAPI.dispatch(setErrorStepCreating(data));
          } catch {
            thunkAPI.dispatch(
              setErrorStepCreating({
                message: 'Неизвестная ошибка при заведении теста',
              })
            );
          }
          es.close();
          reject(new Error('SSE error'));
        });
      });
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const abTestsSlice = createSlice({
  name: 'abTests',
  initialState: initialState,
  reducers: {
    setIntermediateStatusSettings(state, action) {
      const message = action.payload.message;

      // Если это первый шаг
      if (state.settings.statusSteps.length === 0) {
        state.settings.statusSteps.push({ message, state: 'loading' });
        return;
      }

      // Меняем предыдущему статус на success
      state.settings.statusSteps = state.settings.statusSteps.map(
        (step, idx, arr) =>
          idx === arr.length - 1 ? { ...step, state: 'success' } : step
      );

      // Добавляем новый шаг со спиннером
      state.settings.statusSteps.push({ message, state: 'loading' });
    },

    setErrorStep(state, action) {
      if (state.settings.statusSteps.length > 0) {
        state.settings.statusSteps[
          state.settings.statusSteps.length - 1
        ].state = 'error';
        if (action.payload?.message) {
          state.settings.statusSteps[
            state.settings.statusSteps.length - 1
          ].message = action.payload.message;
        }
      }
    },

    setFinalResultSettings(state, action) {
      // Последний шаг успешно завершён
      if (state.settings.statusSteps.length > 0) {
        state.settings.statusSteps[
          state.settings.statusSteps.length - 1
        ].state = 'success';
      }
      state.settings.finalSettings = action.payload.result;
    },
    resetFinalResultSettings(state, action) {
      // Последний шаг успешно завершён
      state.settings.finalSettings = null;
    },
    resetIntermediateStatusSettings(state, action) {
      // Последний шаг успешно завершён
      state.settings.statusSteps = [];
    },

    setIntermediateStatusCreating(state, action) {
      const message = action.payload.message;

      // Если это первый шаг
      if (state.createProgress.statusSteps.length === 0) {
        state.createProgress.statusSteps.push({ message, state: 'loading' });
        return;
      }

      // Меняем предыдущему статус на success
      state.createProgress.statusSteps = state.createProgress.statusSteps.map(
        (step, idx, arr) =>
          idx === arr.length - 1 ? { ...step, state: 'success' } : step
      );

      // Добавляем новый шаг со спиннером
      state.createProgress.statusSteps.push({ message, state: 'loading' });
    },

    setErrorStepCreating(state, action) {
      if (state.createProgress.statusSteps.length > 0) {
        state.createProgress.statusSteps[
          state.createProgress.statusSteps.length - 1
        ].state = 'error';
        if (action.payload?.message) {
          state.createProgress.statusSteps[
            state.createProgress.statusSteps.length - 1
          ].message = action.payload.message;
        }
      }
    },

    setFinalResultCreating(state, action) {
      // Последний шаг успешно завершён
      if (state.createProgress.statusSteps.length > 0) {
        state.createProgress.statusSteps[
          state.createProgress.statusSteps.length - 1
        ].state = 'success';
      }
      state.createProgress.finalResult = action.payload.result;
    },
    resetFinalResultCreating(state, action) {
      // Последний шаг успешно завершён
      state.createProgress.finalResult = null;
    },
    resetIntermediateStatusCreating(state, action) {
      // Последний шаг успешно завершён
      state.createProgress.statusSteps = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSkuList.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.skuList = createSKUListForAbTests(action.payload);
        state.isLoading = false;
      }
    });
    builder.addCase(fetchSkuList.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchABTests.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.abTests = createABtestsLists(action.payload);
        state.isLoading = false;
      }
    });
    builder.addCase(fetchSingleABTest.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchSingleABTest.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.singleAbTests[action.payload.id] = createABtestSingle(
          action.payload
        );
        state.isLoading = false;
      }
    });
    builder.addCase(fetchABTests.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(deleteABTest.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.abTests = state.abTests.filter(
          (test) => test.testId != action.payload
        );
        state.isLoading = false;
      }
    });
    builder.addCase(deleteABTest.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(pauseABTest.fulfilled, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(pauseABTest.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(startABTest.fulfilled, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(startABTest.pending, (state) => {
      state.isLoading = true;
    });
  },
});

export const {
  setIntermediateStatusSettings,
  setFinalResultSettings,
  setErrorStep,
  resetFinalResultSettings,
  resetIntermediateStatusSettings,
  setIntermediateStatusCreating,
  setFinalResultCreating,
  setErrorStepCreating,
  resetFinalResultCreating,
  resetIntermediateStatusCreating,
} = abTestsSlice.actions;

export const selectStatusSteps = (state) => state.abTests.settings.statusSteps;
export const selectSingleAbTest = (state) => state.abTests.singleAbTests;
export const selectFinalSettings = (state) =>
  state.abTests.settings.finalSettings;
export const selectABTests = (state) => state.abTests.abTests;

export const selectStatusStepsCreating = (state) =>
  state.abTests.createProgress.statusSteps;
export const selectFinalResult = (state) =>
  state.abTests.createProgress.finalResult;

export const selectSkuListForAbTest = (state) => state.abTests.skuList;
export default abTestsSlice.reducer;
