export const selectSkusMetrics = (state) => state.skusMetrics;

export const selectSkusMetricsItems = (state) => state.skusMetrics.items;

export const selectSkusMetricsIsLoading = (state) => state.skusMetrics.isLoading;

export const selectSkusMetricsError = (state) => state.skusMetrics.error;

/** Ключ диапазона («start::end»), за который загружены items. */
export const selectSkusMetricsRangeKey = (state) => state.skusMetrics.rangeKey;
