export const selectOrdersToProcessorsItems = (state) =>
  state.ordersToProcessors.items;
export const selectOrdersToProcessorsIsLoading = (state) =>
  state.ordersToProcessors.isLoading;
export const selectExtraOrders = (state) =>
  state.ordersToProcessors.extraOrders ?? {};
export const selectStartCalcDates = (state) =>
  state.ordersToProcessors.startCalcDates ?? {};