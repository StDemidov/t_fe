import { createSlice } from '@reduxjs/toolkit';
import { subDays, format } from 'date-fns'; // Для работы с датами

const initialState = {
  barcode: {
    category: [],
    dates: {
      start: format(subDays(new Date(), 14), 'MM-dd-yyyy'),
      end: format(subDays(new Date(), 1), 'MM-dd-yyyy'),
    },
    sortingType: 'EBITDA (сред) ↓',
    vCName: '',
    color: [],
  },
  vendorCode: {
    category: [],
    vCName: '',
    abc: [],
    dates: {
      start: format(subDays(new Date(), 14), 'MM-dd-yyyy'),
      end: format(subDays(new Date(), 1), 'MM-dd-yyyy'),
    },
    sortingType: 'EBITDA / день (сумм.) ↓',
    tagsMain: [],
    tagsCloth: [],
    tagsOthers: [],
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
  autoCmpgns: {
    createdBy: '',
    status: [],
    brand: '',
    campName: '',
    sortingType: 'CTR ↓',
  },
  auсCmpgns: {
    status: [],
    campName: '',
    sortingType: 'CTR ↓',
  },
};

const filterSlice = createSlice({
  name: 'filter',
  initialState: initialState,
  reducers: {
    setAutoCmpgCreatedBy: (state, action) => {
      state.autoCmpgns.createdBy = action.payload;
    },
    resetAutoCmpgCreatedBy: (state) => {
      state.autoCmpgns.createdBy = '';
    },
    setAutoCmpgBrand: (state, action) => {
      state.autoCmpgns.brand = action.payload;
    },
    resetAutoCmpgBrand: (state) => {
      state.autoCmpgns.brand = '';
    },
    setAutoCmpgStatus: (state, action) => {
      state.autoCmpgns.status = action.payload;
    },
    resetAutoCmpgStatus: (state, action) => {
      state.autoCmpgns.status = [];
    },
    setAutoCmpgCampName: (state, action) => {
      state.autoCmpgns.campName = action.payload;
    },
    setAuсCmpgStatus: (state, action) => {
      state.auсCmpgns.status = action.payload;
    },
    resetAuсCmpgStatus: (state, action) => {
      state.auсCmpgns.status = [];
    },
    setAuсCmpgCampName: (state, action) => {
      state.auсCmpgns.campName = action.payload;
    },
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
    setAucSortingType: (state, action) => {
      state.auсCmpgns.sortingType = action.payload;
    },
    setAutoCmpgSortingType: (state, action) => {
      state.autoCmpgns.sortingType = action.payload;
    },
    setBarcodeSortingType: (state, action) => {
      state.barcode.sortingType = action.payload;
    },
    setBarcodeCategoryFilter: (state, action) => {
      state.barcode.category = [...action.payload];
    },
    setBarcodeColorFilter: (state, action) => {
      state.barcode.color = [...action.payload];
    },
    resetBarcodeColorFilter: (state) => {
      state.barcode.color = [];
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
    setVendorCodeTagsFilter: (state, action) => {
      state.vendorCode.tagsMain = [...action.payload];
    },
    resetVendorCodeTagsFilter: (state) => {
      state.vendorCode.tagsMain = [];
    },
    setVendorCodeTagsClothFilter: (state, action) => {
      state.vendorCode.tagsCloth = [...action.payload];
    },
    resetVendorCodeTagsClothFilter: (state) => {
      state.vendorCode.tagsCloth = [];
    },
    setVendorCodeTagsOthersFilter: (state, action) => {
      state.vendorCode.tagsOthers = [...action.payload];
    },
    resetVendorCodeTagsOthersFilter: (state) => {
      state.vendorCode.tagsOthers = [];
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
    setBarcodesVCNameFilter: (state, action) => {
      state.barcode.vCName = action.payload;
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
  setVendorCodeTagsFilter,
  resetVendorCodeTagsFilter,
  setVendorCodeTagsClothFilter,
  resetVendorCodeTagsClothFilter,
  setVendorCodeTagsOthersFilter,
  resetVendorCodeTagsOthersFilter,
  setAutoCmpgBrand,
  setAutoCmpgCampName,
  setAutoCmpgCreatedBy,
  setAutoCmpgStatus,
  resetAutoCmpgBrand,
  resetAutoCmpgCreatedBy,
  resetAutoCmpgStatus,
  setAuсCmpgCampName,
  setAuсCmpgStatus,
  resetAuсCmpgStatus,
  setAucSortingType,
  setAutoCmpgSortingType,
  setBarcodeSortingType,
  setBarcodesVCNameFilter,
  setBarcodeColorFilter,
  resetBarcodeColorFilter,
} = filterSlice.actions;

export const selectBarcodeCategoryFilter = (state) =>
  state.filter.barcode.category;

export const selectBarcodeColorFilter = (state) => state.filter.barcode.color;

export const selectCategoryListFilter = (state) =>
  state.filter.category.category;

export const selectVendorCodeCategoryFilter = (state) =>
  state.filter.vendorCode.category;

export const selectVCSortingType = (state) =>
  state.filter.vendorCode.sortingType;

export const selectAucSortingType = (state) =>
  state.filter.auсCmpgns.sortingType;
export const selectAutoCampSortingType = (state) =>
  state.filter.autoCmpgns.sortingType;
export const selectBarcodeSortingType = (state) =>
  state.filter.barcode.sortingType;
export const selectBarcodeVCNameFilter = (state) => state.filter.barcode.vCName;

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
export const selectVCTagsFilter = (state) => state.filter.vendorCode.tagsMain;
export const selectVCTagsClothFilter = (state) =>
  state.filter.vendorCode.tagsCloth;
export const selectVCTagsOthersFilter = (state) =>
  state.filter.vendorCode.tagsOthers;
export const selectAutoCampBrandFilter = (state) =>
  state.filter.autoCmpgns.brand;
export const selectAutoCampCampNamFilter = (state) =>
  state.filter.autoCmpgns.campName;
export const selectAutoCampStatusFilter = (state) =>
  state.filter.autoCmpgns.status;
export const selectAutoCampCreatedByFilter = (state) =>
  state.filter.autoCmpgns.createdBy;
export const selectAucCampCampNameFilter = (state) =>
  state.filter.auсCmpgns.campName;
export const selectAucCampStatusFilter = (state) =>
  state.filter.auсCmpgns.status;

export default filterSlice.reducer;
