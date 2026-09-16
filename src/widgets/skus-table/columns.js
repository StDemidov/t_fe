/**
 * Описания колонок таблицы.
 *
 * Фундамент для настройки вида: колонки можно скрывать, возвращать и менять
 * местами (кроме id «fixed» — первые две, они закреплены). Пока рендерим
 * все видимые колонки в этом порядке.
 *
 * id — ключ колонки (в т.ч. для настроек), label — заголовок,
 * width — ширина колонки (px), key — поле в данных товара, render(item) — рендер.
 */
export const COLUMNS = [
  {
    id: 'article',
    label: 'Артикул',
    width: 400,
    key: 'vendorCode',
    render: (item) => item.vendorCode,
  },
  {
    id: 'tags',
    label: 'Теги',
    width: 180,
    key: 'mainTags',
    render: (item) => item.mainTags,
  },
  {
    id: 'tagsCloth',
    label: 'Теги (ткань)',
    width: 180,
    key: 'clothTags',
    render: (item) => item.clothTags,
  },
  {
    id: 'tagsAdditional',
    label: 'Теги (доп)',
    width: 180,
    key: 'otherTags',
    render: (item) => item.otherTags,
  },
  {
    id: 'selfprice',
    label: 'Себестоимость',
    width: 160,
    key: 'selfprice',
    render: (item) => item.selfpriceWithoutNds,
  },
  {
    id: 'priceBeforeSpp',
    label: 'Цена до СПП',
    width: 220,
    key: 'price',
    // Сводка — последнее не null значение цены по дням.
    render: (item) => lastDaily(item.price),
  },
  {
    id: 'orders',
    label: 'Заказы',
    width: 220,
    key: 'orders',
    // ordersFbw + ordersFbs — объекты {дата: значение}
    render: (item) => sumDaily(item.ordersFbw) + sumDaily(item.ordersFbs),
  },
  {
    id: 'sales',
    label: 'Продажи',
    width: 220,
    key: 'sales',
    render: (item) => sumDaily(item.salesFbw) + sumDaily(item.salesFbs),
  },
  {
    id: 'stocks',
    label: 'Остатки',
    width: 220,
    key: 'stocks',
    render: (item) => sumDaily(item.stocksFbw) + sumDaily(item.stocksFbs),
  },
  {
    id: 'stocksLast',
    label: 'Остатки последние',
    width: 220,
    key: 'stocksLast',
    // Текущие остатки: разбивка FBW / FBS / В пути / Всего.
    render: (item) =>
      (Number(item.stocksFbwCurrent) || 0) +
      (Number(item.stocksFbsCurrent) || 0) +
      (Number(item.quantityOnWayToClientCurrent) || 0) +
      (Number(item.quantityOnWayToWarehouseCurrent) || 0),
  },
  {
    id: 'turnoverFbs',
    label: 'Обор-сть FBS',
    width: 220,
    key: 'turnoverFbs',
    render: (item) => item.turnoverFbs,
  },
  {
    id: 'turnoverFbw',
    label: 'Обор-сть FBW',
    width: 220,
    key: 'turnoverFbw',
    render: (item) => item.turnoverFbw,
  },
  {
    id: 'turnoverTotal',
    label: 'Обор-сть общая',
    width: 220,
    key: 'turnoverTotal',
    render: (item) => item.turnoverTotal,
  },
  {
    id: 'ebitda',
    label: 'EBITDA',
    width: 220,
    key: 'ebitda',
    render: (item) => sumDaily(item.ebitda),
  },
  {
    id: 'ebitdaDay',
    label: 'EBITDA/день',
    width: 220,
    key: 'ebitdaDay',
    render: (item) => averageDaily(item.ebitda),
  },
  {
    id: 'ebitdaNoAds',
    label: 'EBITDA/день без РК',
    width: 220,
    key: 'ebitdaNoAds',
    // Сумма датасета «Fbw + Fbs − реклама» по дням.
    render: (item) => item.ebitdaNoAdsSum,
  },
  {
    id: 'ads',
    label: 'Рекламные расходы',
    width: 220,
    key: 'adsCosts',
    render: (item) => sumDaily(item.adsCosts),
  },
  {
    id: 'crToCart',
    label: 'CR (клик в корзину)',
    width: 220,
    key: 'crToCart',
    render: (item) => item.totalCrToCart,
  },
  {
    id: 'crCartToOrder',
    label: 'CR (корзина в заказ)',
    width: 220,
    key: 'crCartToOrder',
    render: (item) => item.totalCartToOrder,
  },
  {
    id: 'crClickToOrder',
    label: 'CR (клик в заказ)',
    width: 220,
    key: 'crClickToOrder',
    render: (item) => item.totalClickToOrder,
  },
  {
    id: 'cpo',
    label: 'CPO',
    width: 220,
    key: 'cpo',
    render: (item) => item.avgCpo,
  },
  {
    id: 'cps',
    label: 'CPS',
    width: 220,
    key: 'cps',
    render: (item) => item.avgCps,
  },
  {
    id: 'roi',
    label: 'ROI (%)',
    width: 220,
    key: 'roi',
    render: (item) => item.roi,
  },
  {
    id: 'buyout',
    label: 'Процент выкупа',
    width: 220,
    key: 'buyoutPercent',
    render: (item) => item.medianBuyoutPercent,
  },
];

/** Колонки, закреплённые слева (менять местами нельзя). */
export const FIXED_COLUMN_IDS = ['article'];

/** Возвращает видимые колонки в текущем порядке. */
export const getVisibleColumns = (columns = COLUMNS) =>
  columns.filter((column) => !column.hidden);

/** Сумма значений по дням объекта {дата: значение}. */
export const sumDaily = (daily) =>
  daily
    ? Object.values(daily).reduce((sum, value) => sum + (Number(value) || 0), 0)
    : 0;

/** Среднее значение по дням (EBITDA/день); null, если дней нет. */
export const averageDaily = (daily) => {
  if (!daily) return null;
  const values = Object.values(daily);
  if (values.length === 0) return null;
  return (
    values.reduce((sum, value) => sum + (Number(value) || 0), 0) /
    values.length
  );
};

/** Последнее значение по дате; если оно null, берём последнее не null; null, если данных нет. */
export const lastDaily = (daily) => {
  if (!daily) return null;
  const dates = Object.keys(daily).sort();
  for (let i = dates.length - 1; i >= 0; i--) {
    const raw = daily[dates[i]];
    if (raw === null || raw === undefined || raw === '') continue;
    return Number(raw);
  }
  return null;
};
