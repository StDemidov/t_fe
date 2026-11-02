import { apiClient } from '../../../api';
import { endpoints } from '../../../api/endpoints';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Вчерашний день в формате YYYY-mm-dd. Данные по вчера включительно. */
export const getDefaultEndDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatDate(date);
};

/** Дата ровно за 14 дней до переданной endDate, включительно. */
export const getDefaultStartDate = (endDate) => {
  const [year, month, day] = endDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 13);
  return formatDate(date);
};

/**
 * Прогнозы для заказов переработчикам за диапазон дат.
 * @param {{ startDate: string, endDate: string }} range даты в формате YYYY-mm-dd
 * Ответ приходит уже готовым списком — нормализация в slice.
 */
export const fetchOrdersToProcessors = async ({ startDate, endDate }) => {
  const res = await apiClient.get(endpoints.ordersToProcessors.getPredicts, {
    params: { start_date: startDate, end_date: endDate },
  });
  return res.data || [];
};

/** Список созданных заказов для переработчиков. */
export const fetchOrdersToProcessorsOrders = async () => {
  const res = await apiClient.get(endpoints.ordersToProcessors.getOrders);
  const data = res.data;
  return Array.isArray(data) ? data : data?.orders || [];
};

/** Создание одного или нескольких заказов. Тело всегда является массивом. */
export const createOrdersToProcessors = async (orders) => {
  const res = await apiClient.post(
    endpoints.ordersToProcessors.createOrders,
    orders
  );
  return res.data;
};

/** Удаление выбранных заказов по ID. */
export const deleteOrdersToProcessors = async (ordersIdsList) => {
  const payload = ordersIdsList.map(Number);
  const res = await apiClient.delete(endpoints.ordersToProcessors.deleteOrders, {
    data: payload,
  });
  return res.data;
};
