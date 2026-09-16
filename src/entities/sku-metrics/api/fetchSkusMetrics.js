import { apiClient } from '../../../api';
import { endpoints } from '../../../api/endpoints';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Вчерашний день в формате YYYY-mm-dd.
 * Данные на бекенде есть только по вчерашний день включительно.
 */
export const getDefaultEndDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatDate(date);
};

/** Дата ровно за 2 недели (14 дней) до переданной endDate, включительно. */
export const getDefaultStartDate = (endDate) => {
  const [year, month, day] = endDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 13);
  return formatDate(date);
};

/**
 * Запрашивает метрики SKU с бекенда за диапазон дат.
 * @param {{ startDate: string, endDate: string }} range даты в формате YYYY-mm-dd
 * Ответ приходит уже готовым списком — без дополнительной нормализации.
 */
export const fetchSkusMetrics = async ({ startDate, endDate }) => {
  const res = await apiClient.get(endpoints.skusMetrics.getSkusMetrics, {
    params: { start_date: startDate, end_date: endDate },
  });
  return res.data || [];
};
