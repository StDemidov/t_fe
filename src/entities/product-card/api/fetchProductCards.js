import { apiClient } from '../../../api';
import { endpoints } from '../../../api/endpoints';
import { sortSkusByAbc } from '../model/selectors';

/**
 * Нормализует ответ бекенда: группу { imtID, skus } → { id, skus }.
 * Поля товара приходят уже в camelCase — их не трогаем.
 * Артикулы сразу сортируются по ABC (порядок плашек: AAA, A, B, C, NEW).
 */
const normalizeCardGroup = (group) => ({
  id: group.imtID,
  skus: sortSkusByAbc(group.skus || []),
});

export const fetchProductCards = async () => {
  const res = await apiClient.get(endpoints.cardGrouping.getItemCardGroupsData);
  return (res.data || []).map(normalizeCardGroup);
};
