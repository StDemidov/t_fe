import { apiClient } from '../../../api';
import { endpoints } from '../../../api/endpoints';

/** Дата в формате YYYY-MM-DD. */
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Сегодняшний день в формате YYYY-MM-DD — верхняя граница диапазона
 * по умолчанию (в отличие от метрик SKU, где данные есть только по вчера).
 */
export const getDefaultEndDate = () => formatDate(new Date());

/** Месяц до переданной даты в формате YYYY-MM-DD. */
export const getDefaultCampaignStartDate = (endDate) => {
  const [year, month, day] = endDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setMonth(date.getMonth() - 1);
  return formatDate(date);
};

/** Артикулы, доступные для создания рекламной кампании. */
export const fetchPromoSkusForCampaign = async () => {
  const res = await apiClient.get(endpoints.promo.skusForCampaign);
  return res.data || [];
};

/** Состояние рекламных счетов и кешбэка. */
export const fetchPromoBalance = async () => {
  const res = await apiClient.get(endpoints.promo.balance);
  return res.data || {};
};

/** Детальная рекламная кампания с дневными метриками. */
export const fetchPromoCampaign = async ({ id, startDate, endDate }) => {
  const res = await apiClient.get(endpoints.promo.campaign, {
    params: { id, start_date: startDate, end_date: endDate },
  });
  return res.data || {};
};

/** Изменение фиксации метрик рекламной кампании. */
export const updatePromoFixed = async ({ id, isFixed }) => {
  const payload = {
    id: Number(id),
    is_fixed: isFixed,
  };
  console.log('[advert/campaign_fixed] payload:', payload);
  const res = await apiClient.patch(endpoints.promo.campaignFixed, payload);
  return res.data;
};

/** Кластеры рекламной кампании. */
export const fetchPromoClusters = async ({ id }) => {
  const res = await apiClient.get(endpoints.promo.clusters, {
    params: { id },
  });
  return res.data || [];
};

/** Изменение активности кластеров рекламной кампании. */
export const updatePromoClusters = async (changes) => {
  const res = await apiClient.patch(endpoints.promo.clustersDisabled, changes);
  return res.data;
};

/** Логи рекламной кампании за выбранный диапазон дат. */
export const fetchPromoLogs = async ({ id, startDate, endDate }) => {
  const res = await apiClient.get(endpoints.promo.logs, {
    params: {
      id,
      start_date: startDate,
      end_date: endDate,
    },
  });
  return res.data || [];
};

/** Дата ровно за 2 недели (14 дней) до переданной endDate, включительно. */
export const getDefaultStartDate = (endDate) => {
  const [year, month, day] = endDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 13);
  return formatDate(date);
};

/**
 * Работающие рекламные кампании — идут прямо сейчас.
 * @param {{ startDate: string, endDate: string }} range даты в YYYY-MM-DD
 */
export const fetchWorkingPromo = async ({ startDate, endDate }) => {
  const res = await apiClient.get(endpoints.promo.working, {
    params: { start_date: startDate, end_date: endDate },
  });
  return res.data || [];
};

/**
 * Завершённые рекламные кампании — по каждой есть endDatetime.
 * @param {{ startDate: string, endDate: string }} range даты в YYYY-MM-DD
 */
export const fetchFinishedPromo = async ({ startDate, endDate }) => {
  const res = await apiClient.get(endpoints.promo.finished, {
    params: { start_date: startDate, end_date: endDate },
  });
  return res.data || [];
};

/**
 * Кампании в обработке (pending) — поставлены в очередь,
 * без дат и статистики. Диапазон дат не передаётся.
 */
export const fetchPendingPromo = async () => {
  const res = await apiClient.get(endpoints.promo.pending);
  return res.data || [];
};

/**
 * Управление кампаниями: запуск / пауза / завершение / удаление.
 * Все четыре действия принимают список id записей и работают как для одной
 * кампании ([id]), так и для массового выбора.
 * @param {Array<number>} ids id записей кампаний
 */
export const startPromo = async (ids) => {
  const res = await apiClient.post(endpoints.promo.start, { ids_list: ids });
  return res.data;
};

export const pausePromo = async (ids) => {
  const res = await apiClient.post(endpoints.promo.pause, { ids_list: ids });
  return res.data;
};

export const finishPromo = async (ids) => {
  const res = await apiClient.post(endpoints.promo.finish, { ids_list: ids });
  return res.data;
};

export const deletePromo = async (ids) => {
  const res = await apiClient.post(endpoints.promo.delete, { ids_list: ids });
  return res.data;
};

/**
 * Создание рекламных кампаний.
 * На вход — массив объектов (по одному на каждый артикул).
 * @param {Array<Object>} campaigns параметры создаваемых кампаний
 */
export const createPromo = async (campaigns) => {
  const res = await apiClient.post(endpoints.promo.create, campaigns);
  return res.data;
};

/**
 * Изменение настроек рекламных кампаний.
 * В теле — только изменённые параметры (остальные бэкенд не трогает).
 * @param {Object} payload параметры изменения кампании
 */
export const updatePromo = async (payload) => {
  const res = await apiClient.patch(endpoints.promo.update, payload);
  return res.data;
};
