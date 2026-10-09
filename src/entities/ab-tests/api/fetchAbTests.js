import { apiClient } from '../../../api';
import { endpoints } from '../../../api/endpoints';

/**
 * Активные A/B тесты — тесты, которые идут прямо сейчас.
 * Ответ — список тестов с массивом фотографий.
 */
export const fetchActiveAbTests = async () => {
  const res = await apiClient.get(endpoints.abTests.getActive);
  return res.data || [];
};

/**
 * Завершённые A/B тесты — по каждому тесту есть endDatetime
 * и отметка победителя среди фотографий.
 */
export const fetchFinishedAbTests = async () => {
  const res = await apiClient.get(endpoints.abTests.getFinished);
  return res.data || [];
};

/**
 * Тесты в обработке (pending) — поставлены в очередь,
 * без дат старта/окончания и статистики.
 */
export const fetchPendingAbTests = async () => {
  const res = await apiClient.get(endpoints.abTests.getPending);
  return res.data || [];
};

/**
 * Список артикулов, доступных для A/B теста.
 * Используется поиском в окне создания теста — сами тесты отдаются
 * тремя эндпоинтами разделов, здесь только входные данные.
 */
export const fetchSkusTestAvailability = async () => {
  const res = await apiClient.get(endpoints.abTests.getSkusAvailability);
  return res.data || [];
};

/**
 * Данные перед запуском нового теста по артикулу:
 * карточка товара (фотографии) и состояние кошелька.
 *
 * Ответ приходит в «сыром» виде: фотографии — объект с числовыми ключами
 * ('1', '2', …), баланс — объект с типами счёта (0 — счёт, 1 — баланс,
 * 3 — бонусы). Здесь приводим к удобным видам: photos в массив по порядку,
 * balance в объект с теми же ключами, но без строковых индексов.
 *
 * @param {string|number} sku артикул
 * @returns {Promise<{
 *   skuInfo: { sku: number|string, vendorcode: string, photos: Array<string>, positions: Array<number> },
 *   balance: { 0: number, 1: number, 3: number },
 *   cashback: { amount: number, percent: number },
 * }>}
 */
export const fetchAbTestLaunchPrepInfo = async (sku) => {
  const res = await apiClient.get(endpoints.abTests.getLaunchPrepInfo, {
    params: { sku },
  });
  const data = res.data || {};

  // Фотографии приходят объектом с ключами-номерами — сортируем по номеру.
  // Номера (позиции) сохраняем отдельно: ключи не обязаны идти подряд,
  // а для создания теста они уходят в `photos` как внешний ключ.
  const photoEntries = Object.entries(data.skuInfo?.photos || {}).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  return {
    skuInfo: {
      sku: data.skuInfo?.sku ?? sku,
      vendorcode: data.skuInfo?.vendorcode || '',
      photos: photoEntries.map(([, url]) => url),
      positions: photoEntries.map(([position]) => Number(position)),
    },
    // Типы счёта приходят строковыми ключами — приводим к числам.
    balance: {
      0: Number(data.balance?.[0] ?? data.balance?.['0'] ?? 0),
      1: Number(data.balance?.[1] ?? data.balance?.['1'] ?? 0),
      3: Number(data.balance?.[3] ?? data.balance?.['3'] ?? 0),
    },
    cashback: {
      amount: Number(data.cashback?.amount ?? 0),
      percent: Number(data.cashback?.percent ?? 0),
    },
  };
};

/**
 * Создание теста: POST /ab_tests/prepare_ab_test.
 * Тест ставится в очередь, сам запрос ничего полезного не возвращает.
 *
 * @param {{
 *   sku: number|string,
 *   cpm: number,
 *   views_goal: number,
 *   balance_type: number,
 *   photos: Object<string, string>,
 *   budget: number,
 * }} payload
 */
export const prepareAbTestRequest = async (payload) => {
  const res = await apiClient.post(endpoints.abTests.prepareAbTest, payload);
  return res.data;
};

/** GET /ab_tests/pause?id={id} — поставить тест на паузу. */
export const pauseAbTestRequest = async (id) => {
  const res = await apiClient.get(endpoints.abTests.pause, { params: { id } });
  return res.data;
};

/** GET /ab_tests/start?id={id} — запустить тест. */
export const startAbTestRequest = async (id) => {
  const res = await apiClient.get(endpoints.abTests.start, { params: { id } });
  return res.data;
};

/** GET /ab_tests/finish?id={id} — завершить тест. */
export const finishAbTestRequest = async (id) => {
  const res = await apiClient.get(endpoints.abTests.finish, { params: { id } });
  return res.data;
};

/**
 * Удаление теста по его id: DELETE /ab_tests/delete?id={id}.
 * Ответ бэкенда не используется — список обновляется оптимистично.
 *
 * @param {string|number} id тест
 */
export const deleteAbTestRequest = async (id) => {
  await apiClient.delete(endpoints.abTests.delete, { params: { id } });
};