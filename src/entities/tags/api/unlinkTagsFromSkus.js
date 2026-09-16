import { apiClient } from '../../../api';
import { endpoints } from '../../../api/endpoints';

/**
 * Отвязывает тег от списка артикулов.
 *
 * @param {Array<{ tag_name: string, type: string, skus_list: string[] }>} payload
 *   Набор отвязываемых тегов. При одном нажатии — один тег и один артикул.
 * @returns {Promise<Array>} При успехе — пустой массив; при ошибке — список
 *   объектов { tag_name, type, skus_list } с тегами, которые отвязать не удалось.
 */
export const unlinkTagsFromSkus = async (payload) => {
  const res = await apiClient.post(endpoints.tags.unlinkTagsFromSkus, payload);
  return res.data || [];
};
