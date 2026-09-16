import { apiClient } from '../../../api';
import { endpoints } from '../../../api/endpoints';

/**
 * Запрашивает все доступные теги с бекенда.
 *
 * Ответ приходит в виде объекта с категориями:
 * { mainTags: [...], clothTags: [...], otherTags: [...] }.
 * Эти списки понадобятся дальше для привязки тегов к артикулам.
 */
export const fetchTags = async () => {
  const res = await apiClient.get(endpoints.tags.getTags);
  return res.data || {};
};
