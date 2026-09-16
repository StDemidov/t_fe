import { apiClient } from '../../../api';
import { endpoints } from '../../../api/endpoints';

/**
 * Создаёт теги в общем пуле на стороне бекенда.
 *
 * @param {Array<{ tag_name: string, type: string }>} payload
 *   Набор создаваемых тегов.
 * @returns {Promise<void>} При успехе — ничего, при ошибке — реджект.
 */
export const createTag = async (payload) => {
  console.log('Создание тегов:', payload);
  await apiClient.post(endpoints.tags.createTag, payload);
};