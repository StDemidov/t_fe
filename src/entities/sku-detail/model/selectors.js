/** Данные конкретного SKU: { sku, data, range, isLoading, error } | undefined. */
export const selectSkuDetailBySku = (sku) => (state) =>
  state.skuDetail?.bySku?.[String(sku)];

/** Все загруженные SKU (для отладки/обзора): { [sku]: entry }. */
export const selectSkuDetailAll = (state) => state.skuDetail?.bySku || {};