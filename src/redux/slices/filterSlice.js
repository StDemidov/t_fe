import { createSlice } from '@reduxjs/toolkit';
import { subDays, format } from 'date-fns'; // Для работы с датами

const initialState = {
  barcode: {
    category: [],
    dates: {
      start: format(subDays(new Date(), 31), 'MM-dd-yyyy'),
      end: format(subDays(new Date(), 1), 'MM-dd-yyyy'),
    },
  },
  vendorCode: {
    category: [],
    vCName: '',
    abc: [],
    dates: {
      start: format(subDays(new Date(), 14), 'MM-dd-yyyy'),
      end: format(subDays(new Date(), 1), 'MM-dd-yyyy'),
    },
    sortingType: 'EBITDA / день (сумм.) убыв.',
  },
  singleVC: {
    dates: {
      start: format(subDays(new Date(), 31), 'MM-dd-yyyy'),
      end: format(subDays(new Date(), 1), 'MM-dd-yyyy'),
    },
  },
  category: {
    category: [],
    categoryName: '',
    isGoodSeason: 'none',
  },
  tasks: {
    category: '',
    skuOrName: '',
  },
};

const filterSlice = createSlice({
  name: 'filter',
  initialState: initialState,
  reducers: {
    setTasksCategory: (state, action) => {
      state.tasks.category = action.payload;
    },
    resetTasksCategory: (state) => {
      state.tasks.category = '';
    },
    setSkuOrNameTasksFilter: (state, action) => {
      state.tasks.skuOrName = action.payload;
    },
    resetSkuOrNameTasksFilter: (state) => {
      state.tasks.skuOrName = '';
    },
    setVCSortingType: (state, action) => {
      state.vendorCode.sortingType = action.payload;
    },
    setBarcodeCategoryFilter: (state, action) => {
      state.barcode.category = [...action.payload];
    },
    setBarcodeDatesFilter: (state, action) => {
      state.barcode.dates = action.payload;
    },
    resetBarcodeCategoryFilter: (state) => {
      state.barcode.category = [];
    },
    setVendorCodeCategoryFilter: (state, action) => {
      state.vendorCode.category = [...action.payload];
    },
    resetVendorCodeCategoryFilter: (state) => {
      state.vendorCode.category = [];
    },
    setVendorCodeAbcFilter: (state, action) => {
      state.vendorCode.abc = [...action.payload];
    },
    resetVendorCodeAbcFilter: (state) => {
      state.vendorCode.abc = [];
    },
    setVCNameFilter: (state, action) => {
      state.vendorCode.vCName = action.payload;
    },
    setCategoryNameFilter: (state, action) => {
      state.category.categoryName = action.payload;
    },
    setDatesFilter: (state, action) => {
      state.vendorCode.dates = action.payload;
    },
    setSingleVCDatesFilter: (state, action) => {
      state.singleVC.dates = action.payload;
    },
    resetDatesFilter: (state) => {
      state.vendorCode.dates = {
        start: format(subDays(new Date(), 14), 'MM-dd-yyyy'),
        end: format(subDays(new Date(), 1), 'MM-dd-yyyy'),
      };
    },
    resetVCFilters: (state) => {
      state.vendorCode = {
        category: [],
        vCName: '',
        abc: [],
      };
    },
    setCategoryListFilter: (state, action) => {
      state.category.category = [...action.payload];
    },
    resetCategoryListFilter: (state) => {
      state.category.category = [];
    },
  },
});

export const {
  setTasksCategory,
  resetTasksCategory,
  setBarcodeCategoryFilter,
  setBarcodeDatesFilter,
  resetBarcodeCategoryFilter,
  setVendorCodeCategoryFilter,
  resetVendorCodeCategoryFilter,
  setVendorCodeAbcFilter,
  resetVendorCodeAbcFilter,
  setVCNameFilter,
  resetVCFilters,
  setDatesFilter,
  resetDatesFilter,
  setVCSortingType,
  setCategoryListFilter,
  resetCategoryListFilter,
  setCategoryNameFilter,
  setSingleVCDatesFilter,
  setSkuOrNameTasksFilter,
  resetSkuOrNameTasksFilter,
} = filterSlice.actions;

export const selectBarcodeCategoryFilter = (state) =>
  state.filter.barcode.category;

export const selectCategoryListFilter = (state) =>
  state.filter.category.category;

export const selectVendorCodeCategoryFilter = (state) =>
  state.filter.vendorCode.category;

export const selectVCSortingType = (state) =>
  state.filter.vendorCode.sortingType;

export const selectVendorCodeAbcFilter = (state) => state.filter.vendorCode.abc;

export const selectVCNameFilter = (state) => state.filter.vendorCode.vCName;

export const selectCategoryNameFilter = (state) =>
  state.filter.category.categoryName;

export const selectTasksCategory = (state) => state.filter.tasks.category;
export const selectSkuOrNameTasksFilter = (state) =>
  state.filter.tasks.skuOrName;

export const selectVCDatesFilter = (state) => state.filter.vendorCode.dates;
export const selectSingleVCDatesFilter = (state) => state.filter.singleVC.dates;
export const selectBarcodeDatesFilter = (state) => state.filter.barcode.dates;

export default filterSlice.reducer;
