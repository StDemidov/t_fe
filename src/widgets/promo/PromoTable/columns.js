/**
 * Описания колонок таблицы рекламных кампаний.
 *
 * Колонку «Артикул» нельзя скрывать и двигать (id «article»), остальные —
 * их можно скрывать крестиком и перетаскивать.
 *
 * id — ключ колонки (в т.ч. для настроек), label — заголовок,
 * width — ширина колонки (px), key — поле в данных кампании.
 */
export const COLUMNS = [
  {
    id: 'article',
    label: 'Артикул',
    width: 280,
    key: 'vendorcode',
  },
  {
    id: 'rkInfo',
    label: 'Информация об РК',
    width: 340,
    key: 'name',
  },
  {
    id: 'fixation',
    label: 'Фиксация',
    width: 150,
    key: 'isFixed',
  },
  {
    id: 'status',
    label: 'Статус',
    width: 180,
    key: 'status',
  },
  {
    id: 'bids',
    label: 'Ставки',
    width: 140,
    key: 'recBid',
  },
  {
    id: 'budget',
    label: 'Бюджет',
    width: 160,
    key: 'budget',
  },
  {
    id: 'activeHours',
    label: 'Время активности',
    width: 150,
    key: 'hasActiveHours',
  },
  {
    id: 'turnover',
    label: 'Оборачиваемость',
    width: 160,
    key: 'turnoverByBarcodes',
  },
  {
    id: 'thresholds',
    label: 'Пороги',
    width: 170,
    key: 'viewsBench',
  },
  {
    id: 'clusterMetrics',
    label: 'Метрики кластеров',
    width: 240,
    key: 'clustersCtrTotal',
  },
  {
    id: 'spend',
    label: 'Траты',
    width: 220,
    key: 'spend',
  },
  {
    id: 'views',
    label: 'Показы',
    width: 220,
    key: 'views',
  },
  {
    id: 'clicks',
    label: 'Клики',
    width: 220,
    key: 'clicks',
  },
  {
    id: 'addingsToCart',
    label: 'Добавления в корзину',
    width: 220,
    key: 'addingsToCart',
  },
  {
    id: 'ctr',
    label: 'CTR',
    width: 220,
    key: 'ctr',
  },
  {
    id: 'clickToCart',
    label: 'CR клик-корзина',
    width: 220,
    key: 'clickToCart',
  },
  {
    id: 'viewToCart',
    label: 'CR показ-корзина',
    width: 220,
    key: 'viewToCart',
  },
  {
    id: 'actions',
    label: 'Действия',
    width: 232,
    key: null,
  },
];

/** Колонки, закреплённые слева (менять местами нельзя). */
export const FIXED_COLUMN_IDS = ['article'];

/** Колонка, закреплённая справа (нельзя скрывать и двигать). */
export const FIXED_RIGHT_COLUMN_ID = 'actions';

/** Сумма значений по дням объекта {дата: значение}. */
export const sumDaily = (daily) =>
  daily
    ? Object.values(daily).reduce((sum, value) => sum + (Number(value) || 0), 0)
    : 0;
