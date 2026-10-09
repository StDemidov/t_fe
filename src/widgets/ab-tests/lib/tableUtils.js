/** Размер страницы по умолчанию и варианты выбора. */
export const PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [25, 50, 100];

/**
 * Разбивает список на страницы.
 * @param {Array} list
 * @param {number} page текущая страница (с 1)
 * @param {number} pageSize
 * @returns {{ pages: Array<Array>, totalPages: number, currentPageData: Array }}
 */
export const paginateList = (list, page, pageSize = PAGE_SIZE) => {
  const pages = [];
  for (let i = 0; i < list.length; i += pageSize)
    pages.push(list.slice(i, i + pageSize));
  if (pages.length === 0)
    return { pages: [[]], totalPages: 1, currentPageData: [] };
  const safePage = Math.min(Math.max(page, 1), pages.length);
  return {
    pages,
    totalPages: pages.length,
    currentPageData: pages[safePage - 1],
  };
};

/** Время в миллисекундах; null, если даты нет или она не разбирается. */
const toTime = (value) => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

/**
 * Сортировка тестов по дате, от свежего к старому.
 * Тесты без даты уходят в конец списка.
 *
 * @param {Array} items тесты раздела
 * @param {keyof object} field поле с датой ('startDatetime' | 'endDatetime')
 * @returns {Array} новый отсортированный массив
 */
export const sortByDateDesc = (items, field) =>
  [...items].sort((a, b) => {
    const timeA = toTime(a[field]);
    const timeB = toTime(b[field]);
    if (timeA === null && timeB === null) return 0;
    if (timeA === null) return 1;
    if (timeB === null) return -1;
    return timeB - timeA;
  });

/**
 * Порядок разделов и их правила сортировки.
 * 'active' — по дате старта, 'finished' — по дате окончания,
 * 'pending' — без сортировки (в очереди порядок отдаёт бэкенд).
 */
export const SORT_RULES = {
  active: 'startDatetime',
  finished: 'endDatetime',
  pending: null,
};