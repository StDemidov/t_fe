import { apiClient } from '../../../api';
import { endpoints } from '../../../api/endpoints';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Сдвиг даты на days дней (отрицательные — в прошлое). */
const shiftDate = (dateString, days) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

/**
 * Дефолтный диапазон дат для страницы товара:
 * end_date — вчера (данные на бекенде есть только по вчера включительно),
 * start_date — 30 дней назад от end_date. Даты сравнения вычисляются
 * автоматически (см. computeComparisonRange).
 */
export const getDefaultSkuDetailRange = () => {
  const endDate = shiftDate(formatDate(new Date()), -1);
  const startDate = shiftDate(endDate, -30);
  return { startDate, endDate };
};

/**
 * Считает период сравнения: промежуток той же длины, что и выбранный,
 * расположенный непосредственно перед ним.
 *
 * Например, для диапазона с 1 по 8 сентября (8 дней) сравнение —
 * с 24 по 31 августа; для 7–8 сентября — 5–6 сентября.
 */
const computeComparisonRange = ({ startDate, endDate }) => {
  const start = new Date(...startDate.split('-').map(Number));
  const end = new Date(...endDate.split('-').map(Number));
  const lengthDays =
    Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1;
  const comparisonEndDate = shiftDate(startDate, -1);
  const comparisonStartDate = shiftDate(comparisonEndDate, -(lengthDays - 1));
  return { comparisonStartDate, comparisonEndDate };
};

/**
 * Запрашивает детальные данные одного SKU с бекенда.
 *
 * @param {object} params
 * @param {string|number} params.sku — SKU товара
 * @param {object} [params.range] — основной диапазон дат { startDate, endDate };
 *   даты сравнения считаются автоматически.
 */
export const fetchSkuDetail = async ({ sku, range } = {}) => {
  const mainRange = range || getDefaultSkuDetailRange();
  const comparisonRange = computeComparisonRange(mainRange);
  const res = await apiClient.get(endpoints.skuDetail.getSkuDetailed, {
    params: {
      start_date: mainRange.startDate,
      end_date: mainRange.endDate,
      comparison_end_date: comparisonRange.comparisonEndDate,
      comparison_start_date: comparisonRange.comparisonStartDate,
      sku,
    },
  });
  return { data: res.data || {}, range: { ...mainRange, ...comparisonRange } };
};

/** Запрашивает метрики карточки товара по SKU. */
export const fetchCardMetrics = async ({ sku } = {}) => {
  const res = await apiClient.get(endpoints.skuDetail.getCardMetrics, {
    params: { sku },
  });
  return res.data || {};
};