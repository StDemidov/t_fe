import { createSelector } from '@reduxjs/toolkit';

/**
 * Группа с id = -1 — «свободные товары» (без карточки).
 */
export const FREE_GROUP_ID = -1;

/**
 * Порядок ABC-категорий в интерфейсе (как у плашек): AAA, A, B, C, NEW,
 * всё неизвестное — в конце.
 */
export const ABC_ORDER = ['AAA', 'A', 'B', 'C', 'NEW'];

const abcRank = (abc) => {
  const i = ABC_ORDER.indexOf(abc);
  return i === -1 ? ABC_ORDER.length : i;
};

/**
 * Чистая функция: сортирует артикулы по ABC — по тому же принципу, что плашки.
 * Неизвестные категории — в конец; порядок внутри категории сохраняется.
 */
export const sortSkusByAbc = (skus) =>
  [...skus].sort((a, b) => abcRank(a.abc) - abcRank(b.abc));

/**
 * Чистая функция: делит товары на группы по ABC.
 * Порядок секций: AAA, A, B, C, NEW, затем всё остальное.
 */
export const groupSkusByAbc = (skus) => {
  const grouped = new Map();
  for (const sku of skus) {
    const abc = sku.abc || '—';
    if (!grouped.has(abc)) grouped.set(abc, []);
    grouped.get(abc).push(sku);
  }
  return [...grouped.entries()]
    .sort((a, b) => abcRank(a[0]) - abcRank(b[0]))
    .map(([abc, items]) => ({ abc, skus: items }));
};

export const selectProductCards = (state) => state.productCards;

/**
 * Суммирует дневные таймсерии товаров ({'YYYY-MM-DD': число | null}) в одну
 * суммарную таймсерию: по каждой дате сумма значений, null считается нулём.
 */
const mergeDaily = (dailies) => {
  const result = {};
  for (const daily of dailies) {
    for (const [date, value] of Object.entries(daily)) {
      result[date] = (result[date] || 0) + (Number(value) || 0);
    }
  }
  return result;
};

/**
 * Агрегаты по товарам карточки: количество по ABC-категориям, суммы заказов,
 * кликов, рекламных расходов, остатков, выручка и ДРР (реклама / выручка).
 *
 * Суммарные дневные таймсерии (ordersDaily, clicksDaily, adsCostsDaily) собираются
 * по датам из таймсерий всех товаров — они пригодятся для графика и для
 * пересчёта показателей при переносе товаров между карточками. Итоги (totalOrders,
 * totalClicks, totalAdsCosts) считаются из этих же таймсерий.
 */
export const getCardStats = (skus) => {
  const abcCounts = {};
  const ordersDailies = [];
  const clicksDailies = [];
  const adsDailies = [];
  let totalRevenue = 0;
  let totalStock = 0;
  for (const sku of skus) {
    // Артикулы без ABC (null) в плашки не попадают.
    const abc = (sku.abc || '').toUpperCase();
    if (abc) abcCounts[abc] = (abcCounts[abc] || 0) + 1;
    totalRevenue += sku.revenue || 0;
    totalStock += sku.stocks || 0;
    if (sku.ordersDaily && typeof sku.ordersDaily === 'object')
      ordersDailies.push(sku.ordersDaily);
    if (sku.clicksDaily && typeof sku.clicksDaily === 'object')
      clicksDailies.push(sku.clicksDaily);
    if (sku.adsCostsDaily && typeof sku.adsCostsDaily === 'object')
      adsDailies.push(sku.adsCostsDaily);
  }
  const ordersDaily = mergeDaily(ordersDailies);
  const clicksDaily = mergeDaily(clicksDailies);
  const adsCostsDaily = mergeDaily(adsDailies);
  const sumValues = (daily) =>
    Object.values(daily).reduce((sum, value) => sum + value, 0);
  const totalOrders = sumValues(ordersDaily);
  const totalClicks = sumValues(clicksDaily);
  const totalAdsCosts = sumValues(adsCostsDaily);
  return {
    abcCounts,
    ordersDaily,
    clicksDaily,
    adsCostsDaily,
    totalOrders,
    totalClicks,
    totalAdsCosts,
    totalRevenue,
    totalStock,
    drr: totalRevenue > 0 ? totalAdsCosts / totalRevenue : null,
  };
};

export const selectCards = (state) => state.productCards.cards;

export const selectIsLoading = (state) => state.productCards.isLoading;

export const selectError = (state) => state.productCards.error;

/** Все группы, кроме «свободных товаров». */
export const selectCardGroups = (state) =>
  state.productCards.cards.filter((group) => group.id !== FREE_GROUP_ID);

/** Товары группы по id (пустой массив, если группы нет). */
export const selectSkusByGroupId = (state, groupId) => {
  const group = state.productCards.cards.find((item) => item.id === groupId);
  return group ? group.skus : [];
};

/** Товары «свободной» группы (id = -1). */
export const selectFreeSkus = (state) =>
  selectSkusByGroupId(state, FREE_GROUP_ID);

/** «Свободные» товары, разбитые на секции по ABC. */
export const selectFreeSkusByAbc = createSelector(
  [selectFreeSkus],
  (freeSkus) => groupSkusByAbc(freeSkus)
);

/**
 * Агрегаты одного артикула: остатки, клики, заказы, добавления в корзину,
 * рекламные расходы и CR корзины (добавления / клики; null — кликов нет).
 * Дневные метрики — таймсерии {'YYYY-MM-DD': число | null}; null считается нулём.
 */
export const getSkuStats = (sku) => {
  const sumDaily = (daily) =>
    daily && typeof daily === 'object'
      ? Object.values(daily).reduce(
          (sum, value) => sum + (Number(value) || 0),
          0
        )
      : 0;
  const clicks = sumDaily(sku.clicksDaily);
  const cart = sumDaily(sku.addingsToCartDaily);
  return {
    stocks: sku.stocks || 0,
    clicks,
    orders: sumDaily(sku.ordersDaily),
    cart,
    ads: sumDaily(sku.adsCostsDaily),
    crCart: clicks > 0 ? cart / clicks : null,
  };
};

/**
 * Сортирует артикулы по метрике «метрика:направление». Ряды должны содержать
 * статистику в поле stats (см. getSkuStats). АВС: «desc» = лучшие категории
 * первыми (AAA, A, B, C, NEW), «asc» = худшие первыми.
 */
export const sortSkusByMetric = (rows, sortValue) => {
  const [metric, direction] = sortValue.split(':');
  const sign = direction === 'asc' ? 1 : -1;
  if (metric === 'abc') {
    // «Убывание» по АВС = лучшие категории первыми: AAA, A, B, C, NEW.
    const abcSign = direction === 'desc' ? 1 : -1;
    return [...rows].sort(
      (a, b) => abcSign * (abcRank(a.abc) - abcRank(b.abc))
    );
  }
  return [...rows].sort(
    (a, b) =>
      sign *
      ((Number(a.stats?.[metric]) || 0) - (Number(b.stats?.[metric]) || 0))
  );
};
