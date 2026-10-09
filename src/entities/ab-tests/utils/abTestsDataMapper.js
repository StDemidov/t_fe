/** Приводит значение к строке или null (для дат). */
const toDate = (value) => (value ? String(value) : null);

/** Приводит значение к числу; null, если значения нет. */
const toNumber = (value) => (value == null || value === '' ? null : Number(value));

/**
 * Нормализация фотографии теста.
 * Набор полей зависит от раздела: у активных есть статистика и отметки
 * тестируемости, у завершённых — отметка победителя.
 * Раздел «В обработке» фото не использует — там одна фотка в поле `photo`.
 */
const normalizePhoto = (raw = {}) => ({
  photo: raw.photo || '',
  isTested: Boolean(raw.isTested),
  isCurrentlyTesting: Boolean(raw.isCurrentlyTesting),
  isWinner: Boolean(raw.isWinner),
  queuePosition: toNumber(raw.queuePosition),
  views: toNumber(raw.views),
  clicks: toNumber(raw.clicks),
});

/**
 * Нормализация одного A/B теста.
 * Общая структура для всех трёх разделов — различаются только заполненные поля.
 *
 * @param {object} raw тест из API
 * @returns {{
 *   id: number,
 *   abTestAdId: number|null,
 *   sku: number|string,
 *   vendorCode: string,
 *   cpm: number|null,
 *   viewsGoal: number|null,
 *   startDatetime: string|null,
 *   endDatetime: string|null,
 *   status: number|null,
 *   photo: string,
 *   photos: Array<object>,
 * }}
 */
export const mapAbTest = (raw) => ({
  id: raw.id,
  // id РК в WB — есть у активных и завершённых, отсутствует у ожидающих
  abTestAdId: toNumber(raw.abTestAdId),
  sku: raw.sku,
  vendorCode: raw.vendorcode || '',
  cpm: toNumber(raw.cpm),
  viewsGoal: toNumber(raw.viewsGoal),
  startDatetime: toDate(raw.startDatetime),
  endDatetime: toDate(raw.endDatetime),
  // Статус этапа подготовки — только у тестов «В обработке»
  status: toNumber(raw.status),
  // Одна фотка — новый формат раздела «В обработке»
  photo: raw.photo || '',
  photos: Array.isArray(raw.photos) ? raw.photos.map(normalizePhoto) : [],
});