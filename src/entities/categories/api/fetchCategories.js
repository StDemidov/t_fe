import { apiClient } from '../../../api';
import { endpoints } from '../../../api/endpoints';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Вчерашний день в формате YYYY-mm-dd (данные есть по вчерашний день включительно). */
export const getDefaultEndDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatDate(date);
};

/** Дата ровно за 30 дней до переданной endDate, включительно. */
export const getDefaultStartDate = (endDate) => {
  const [year, month, day] = endDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 30);
  return formatDate(date);
};

/**
 * Категории с метриками за диапазон дат.
 * @param {{ startDate: string, endDate: string }} range даты в формате YYYY-mm-dd
 * Ответ приходит списком категорий либо объектом вида { categories: [...] } —
 * в обоих случаях достаём массив элементов.
 */
export const fetchCategories = async ({ startDate, endDate }) => {
  const res = await apiClient.get(endpoints.categories.getCategories, {
    params: { start_date: startDate, end_date: endDate },
  });
  const raw = res.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.categories)) return raw.categories;
  return [];
};