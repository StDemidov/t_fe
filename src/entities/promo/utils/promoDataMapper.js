/** Датасеты метрик кампании: объекты {дата: значение}. */
const DAILY_FIELDS = [
  'orders',
  'views',
  'clicks',
  'addingsToCart',
  'spend',
  'ctr',
  'clickToCart',
  'viewToCart',
];

/** Числовые поля-саммари, приходящие в metrics. */
const SUM_FIELDS = [
  'ordersSum',
  'viewsSum',
  'clicksSum',
  'addingsToCartSum',
  'spendSum',
  'ctrTotal',
  'clickToCartTotal',
  'viewToCartTotal',
];

/** Саммари кластеров — лежат на верхнем уровне объекта кампании, не в metrics. */
const CLUSTER_SUM_FIELDS = [
  'clustersCtrTotal',
  'clustersClickToCartTotal',
  'clustersViewToCartTotal',
];

/**
 * Нормализация рекламной кампании с бэкенда.
 *
 * Ответ рабочих и завершённых кампаний приходит с вложенным объектом
 * `metrics` (датасеты по дням и саммари); «В обработке» отдаёт ту же
 * форму без metrics и дат. Разворачиваем метрики в плоские поля строки —
 * таблица читает их напрямую (item.spend, item.spendSum …).
 *
 * @param {object} raw объект кампании из API
 * @returns {object} кампания с плоскими полями метрик
 */
export const mapPromo = (raw) => {
  const metrics = raw?.metrics || {};
  const item = { ...raw };

  // Датасеты: приводим к чистым объектам {дата: число}.
  for (const field of DAILY_FIELDS) {
    const daily = metrics[field];
    if (daily && typeof daily === 'object') {
      const normalized = {};
      for (const [date, value] of Object.entries(daily)) {
        normalized[date] = Number(value) || 0;
      }
      item[field] = normalized;
    } else {
      item[field] = {};
    }
  }

  // Саммари: числа (или null, если бэкенд явно передал пустое значение).
  for (const field of SUM_FIELDS) {
    const value = metrics[field];
    item[field] =
      value === null || value === undefined ? null : Number(value) || 0;
  }

  // Саммари кластеров приходят прямо в объекте кампании (не в metrics) —
  // просто нормализуем их в числа.
  for (const field of CLUSTER_SUM_FIELDS) {
    const value = raw?.[field];
    item[field] =
      value === null || value === undefined ? null : Number(value) || 0;
  }

  return item;
};
