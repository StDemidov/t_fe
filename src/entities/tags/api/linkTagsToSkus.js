import { apiClient } from '../../../api';
import { endpoints } from '../../../api/endpoints';

/**
 * Привязывает теги к артикулам.
 *
 * @param {Array<{ tag_name: string, type: string, skus_list: string[] }>} payload
 *   Набор привязываемых тегов. Тело аналогично unlink_tags_from_skus.
 * @returns {Promise<Array>} При успехе — пустой массив; при ошибке — список
 *   объектов { tag_name, type, skus_list } с тегами, которые привязать не удалось.
 */
export const linkTagsToSkus = async (payload) => {
  const res = await apiClient.post(endpoints.tags.linkTagsToSkus, payload);
  return res.data || [];
};
