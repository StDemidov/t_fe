/**
 * Статусы A/B теста.
 *
 * Статусы подготовки («В обработке») и статусы запущенного теста
 * («Активные») живут в раздельных картах — коды не пересекаются.
 * Тона: `info` — процесс идёт, `error` — шаг упал, `success` — тест готов,
 * `wait` — ждём, `neutral` — служебный.
 */

/** Статусы этапов подготовки теста — раздел «В обработке». */
export const AB_TEST_STATUSES = {
  0: { label: 'Создаем РК', tone: 'info' },
  40: { label: 'Ошибка создания РК', tone: 'error' },
  1: { label: 'Установка СРМ', tone: 'info' },
  41: { label: 'Ошибка установки СРМ', tone: 'error' },
  2: { label: 'Пополнение бюджета', tone: 'info' },
  42: { label: 'Ошибка пополнения бюджета', tone: 'error' },
  3: { label: 'Ожидает старта', tone: 'wait' },
  43: { label: 'Ошибка запуска РК', tone: 'error' },
  4: { label: 'Готова к запуску', tone: 'success' },
  213: { label: 'Ожидает удаления', tone: 'neutral' },
};

/** Статусы запущенного теста — раздел «Активные». */
export const AB_TEST_ACTIVE_STATUSES = {
  9: { label: 'Тест активен', tone: 'success' },
  11: { label: 'Тест на паузе', tone: 'wait' },
  211: { label: 'Ждет паузу', tone: 'info' },
  29: { label: 'Ждет активации', tone: 'info' },
  45: { label: 'Ошибка добавления бюджета', tone: 'error' },
  212: { label: 'Ожидает завершения', tone: 'neutral' },
};

/** Объединённая карта для поиска статуса в любом разделе. */
const ALL_STATUSES = {
  ...AB_TEST_STATUSES,
  ...AB_TEST_ACTIVE_STATUSES,
};

/** Статусы, у которых есть кнопка удаления в «В обработке». */
const DELETABLE_STATUSES = new Set(['0', '40', '1', '41', '2', '42', '3', '43', '4']);

/** Статусы активного теста, у которых есть кнопка удаления. */
const ACTIVE_DELETABLE_STATUSES = new Set(['9', '11', '211', '29', '45']);

/**
 * Можно ли удалить тест в разделе «В обработке» по его статусу.
 *
 * @param {number|string|null} code
 * @returns {boolean}
 */
export const isPendingDeletable = (code) => code != null && DELETABLE_STATUSES.has(String(code));

/**
 * Можно ли удалить активный тест по его статусу.
 *
 * @param {number|string|null} code
 * @returns {boolean}
 */
export const isActiveDeletable = (code) => code != null && ACTIVE_DELETABLE_STATUSES.has(String(code));

/**
 * Подпись и тон по коду статуса.
 * Неизвестный код показываем как есть, чтобы новые статусы бэкенда
 * не пропадали из таблицы молча.
 *
 * @param {number|string|null} code
 * @returns {{ label: string, tone: string }|null} null, если статуса нет
 */
export const getAbTestStatus = (code) => {
  if (code == null || code === '') return null;
  const known = ALL_STATUSES[code];
  if (known) return known;
  return { label: `Статус ${code}`, tone: 'neutral' };
};

/**
 * Варианты для фильтра по статусу — в порядке статусов,
 * а не по алфавиту, чтобы список повторял этапы подготовки теста.
 *
 * @returns {Array<{ value: string, label: string }>}
 */
export const getAbTestStatusOptions = () =>
  Object.entries(AB_TEST_STATUSES).map(([value, { label }]) => ({
    value,
    label,
  }));