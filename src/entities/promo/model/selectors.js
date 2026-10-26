/** Список кампаний раздела: 'active' | 'finished' | 'pending'. */
export const selectPromoItems = (status) => (state) =>
  state.promo?.[status]?.items ?? [];

/** Идёт ли загрузка раздела. */
export const selectPromoIsLoading = (status) => (state) =>
  Boolean(state.promo?.[status]?.isLoading);

/** Ошибка загрузки раздела. */
export const selectPromoError = (status) => (state) =>
  state.promo?.[status]?.error ?? null;

/** Загружен ли раздел хотя бы раз — чтобы не ходить в API повторно. */
export const selectPromoIsLoaded = (status) => (state) =>
  Boolean(state.promo?.[status]?.isLoaded);

/** Диапазон дат, за который загружен раздел (null для «В обработке»). */
export const selectPromoRange = (status) => (state) =>
  state.promo?.[status]?.range ?? null;
