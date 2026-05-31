import { createSlice } from '@reduxjs/toolkit';
import { subDays, format } from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const defaultDateRange = () => ({
  start: format(subDays(new Date(), 14), 'yyyy-MM-dd'),
  end: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
});

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  /** Диапазон дат для расчёта EBITDA и заказов */
  dateRange: defaultDateRange(),

  /** Тип сортировки артикулов */
  sortingType: 'EBITDA (сред) ↓',

  /** Текстовый поиск по имени артикула или SKU */
  vcNameQuery: '',

  /** Выбранные категории */
  categories: [],

  /** Основные теги */
  tagsMain: [],

  /** Теги по ткани */
  tagsCloth: [],

  /** Прочие теги */
  tagsOthers: [],

  /** Страна */
  countries: [],

  /** Лекало */
  patterns: [],

  /** Названия заказов */
  orderNames: [],

  /** Дата дедлайна (горизонт Ганта) */
  // 2 years from today — computed dynamically
  ganttDeadline: (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d.toISOString().split('T')[0];
  })(),
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const inventoryFilterSlice = createSlice({
  name: 'inventoryFilter',
  initialState,
  reducers: {
    setInventoryDateRange(state, action) {
      state.dateRange = action.payload;
    },
    resetInventoryDateRange(state) {
      state.dateRange = defaultDateRange();
    },

    setInventorySortingType(state, action) {
      state.sortingType = action.payload;
    },

    setInventoryVcNameQuery(state, action) {
      state.vcNameQuery = action.payload;
    },
    resetInventoryVcNameQuery(state) {
      state.vcNameQuery = '';
    },

    setInventoryCategories(state, action) {
      state.categories = [...action.payload];
    },
    resetInventoryCategories(state) {
      state.categories = [];
    },

    setInventoryTagsMain(state, action) {
      state.tagsMain = [...action.payload];
    },
    resetInventoryTagsMain(state) {
      state.tagsMain = [];
    },

    setInventoryTagsCloth(state, action) {
      state.tagsCloth = [...action.payload];
    },
    resetInventoryTagsCloth(state) {
      state.tagsCloth = [];
    },

    setInventoryCountries(state, action) {
      state.countries = [...action.payload];
    },
    resetInventoryCountries(state) {
      state.countries = [];
    },

    setInventoryPatterns(state, action) {
      state.patterns = [...action.payload];
    },
    resetInventoryPatterns(state) {
      state.patterns = [];
    },
    setInventoryOrderNames(state, action) {
      state.orderNames = [...action.payload];
    },
    resetInventoryOrderNames(state) {
      state.orderNames = [];
    },

    setInventoryTagsOthers(state, action) {
      state.tagsOthers = [...action.payload];
    },
    resetInventoryTagsOthers(state) {
      state.tagsOthers = [];
    },

    setInventoryGanttDeadline(state, action) {
      state.ganttDeadline = action.payload;
    },
    resetInventoryGanttDeadline(state) {
      state.ganttDeadline = (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 2);
        return d.toISOString().split('T')[0];
      })();
    },
  },
});

export const {
  setInventoryDateRange,
  resetInventoryDateRange,
  setInventorySortingType,
  setInventoryVcNameQuery,
  resetInventoryVcNameQuery,
  setInventoryCategories,
  resetInventoryCategories,
  setInventoryTagsMain,
  resetInventoryTagsMain,
  setInventoryTagsCloth,
  resetInventoryTagsCloth,
  setInventoryCountries,
  resetInventoryCountries,
  setInventoryPatterns,
  resetInventoryPatterns,
  setInventoryOrderNames,
  resetInventoryOrderNames,
  setInventoryTagsOthers,
  resetInventoryTagsOthers,
  setInventoryGanttDeadline,
  resetInventoryGanttDeadline,
} = inventoryFilterSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectInventoryDateRange = (state) =>
  state.inventoryFilter.dateRange;
export const selectInventorySortingType = (state) =>
  state.inventoryFilter.sortingType;
export const selectInventoryVcNameQuery = (state) =>
  state.inventoryFilter.vcNameQuery;
export const selectInventoryCategories = (state) =>
  state.inventoryFilter.categories;
export const selectInventoryTagsMain = (state) =>
  state.inventoryFilter.tagsMain;
export const selectInventoryTagsCloth = (state) =>
  state.inventoryFilter.tagsCloth;
export const selectInventoryTagsOthers = (state) =>
  state.inventoryFilter.tagsOthers;
export const selectInventoryCountries = (state) =>
  state.inventoryFilter.countries;
export const selectInventoryPatterns = (state) =>
  state.inventoryFilter.patterns;
export const selectInventoryOrderNames = (state) =>
  state.inventoryFilter.orderNames;
export const selectInventoryGanttDeadline = (state) =>
  state.inventoryFilter.ganttDeadline;

export default inventoryFilterSlice.reducer;
