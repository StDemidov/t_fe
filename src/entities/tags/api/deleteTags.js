import { apiClient } from '../../../api';
import { endpoints } from '../../../api/endpoints';

/**
 * Удаляет теги из общего пула (и с привязанных артикулов на стороне бекенда).
 *
 * @param {Array<{ tag_name: string, type: string }>} payload
 *   Набор удаляемых тегов.
 * @returns {Promise<Array>} При успехе — пустой массив; при ошибке — список
 *   объектов { tag_name, type } с тегами, которые удалить не удалось.
 */
export const deleteTags = async (payload) => {
  console.log('Удаление тегов:', payload);
  const res = await apiClient.delete(endpoints.tags.deleteTags, { data: payload });
  return res.data || [];
};