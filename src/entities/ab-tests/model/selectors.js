/** Список тестов раздела: 'active' | 'finished' | 'pending'. */
export const selectAbTestsItems = (status) => (state) =>
  state.abTestsNew?.[status]?.items ?? [];

/** Идёт ли загрузка раздела. */
export const selectAbTestsIsLoading = (status) => (state) =>
  Boolean(state.abTestsNew?.[status]?.isLoading);

/** Ошибка загрузки раздела. */
export const selectAbTestsError = (status) => (state) =>
  state.abTestsNew?.[status]?.error ?? null;

/** Загружен ли раздел хотя бы раз — чтобы не ходить в API повторно. */
export const selectAbTestsIsLoaded = (status) => (state) =>
  Boolean(state.abTestsNew?.[status]?.isLoaded);