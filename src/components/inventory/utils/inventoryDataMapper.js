// ─── Size ordering for sorting barcodes ──────────────────────────────────────

const SIZE_ORDER = [
  'XXS-XS', 'S-M', 'L-XL',
  'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '4XL',
  'XS/155', 'S/155', 'M/155', 'L/155', 'XL/155', 'XXL/155',
  'XS/175', 'S/175', 'M/175', 'L/175', 'XL/175', 'XXL/175',
  'XS РОСТ 1', 'S РОСТ 1', 'M РОСТ 1', 'L РОСТ 1', 'XL РОСТ 1', 'XXL РОСТ 1',
  'XS РОСТ 2', 'S РОСТ 2', 'M РОСТ 2', 'L РОСТ 2', 'XL РОСТ 2', 'XXL РОСТ 2',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseNumberArray = (val) => {
  if (Array.isArray(val)) return val.map(Number);
  if (typeof val === 'string' && val.length) return val.split(',').map(Number);
  return [];
};

/**
 * Маппинг одного артикула из API
 * @param {Object} raw — сырой объект из API
 * @returns {Object} SkuItem
 */
const mapSkuItem = (raw) => ({
  id: raw.id,
  sku: raw.sku,
  vcName: raw.vc_name,
  startDate: new Date(raw.start_date),

  // Временные ряды данных (последние N дней, от старого к новому)
  ordersTimeSeries: parseNumberArray(raw.orders),
  ebitdaTimeSeries: parseNumberArray(raw.ebitda),
  ebitdaDailyTimeSeries: parseNumberArray(raw.daily_ebitda),
  pricesTimeSeries: parseNumberArray(raw.prices),
  adsCostsTimeSeries: parseNumberArray(raw.ads_costs),

  // Классификация
  abc: raw.abc,
  abcCategory: raw.abc_ctrgy,
  category: raw.category?.name ?? '',

  // Медиа
  image: raw.image,

  // Финансы
  selfPrice: Math.round(raw.self_price),

  // Теги
  tagsMain: raw.tags_main ?? [],
  tagsCloth: raw.tags_cloth ?? [],
  tagsOthers: raw.tags_others ?? [],

  // Новые поля
  pattern: raw.pattern ?? '',
  buyout: raw.barcodes?.[0]?.buyout != null
    ? Math.round(raw.barcodes[0].buyout * 100)
    : raw.buyout != null ? Math.round(raw.buyout * 100) : null,
  ordersNames: Array.isArray(raw.orders_names) ? raw.orders_names : [],

  // Баркоды, отсортированные по размеру
  barcodes: (raw.barcodes ?? [])
    .sort((a, b) => {
      const ai = SIZE_ORDER.indexOf(a.size?.toUpperCase());
      const bi = SIZE_ORDER.indexOf(b.size?.toUpperCase());
      return ai - bi;
    })
    .map((bc) => ({
      barcode: bc.barcode,
      stock: bc.stock,
      avgOrders: bc.avg_orders ?? 0,
      buyout: bc.buyout ?? 1,
      size: bc.size,
      /** Прогноз продаж по неделям [неделя0, неделя1, ...] */
      weeklyForecasts: parseNumberArray(bc.forecasts),
    })),
});

/**
 * Маппинг словаря заказов из API
 * @param {Array} ordersRaw — массив заказов из API
 * @returns {Object} { [barcode]: [{name, amount, date}] }
 */
const mapOrdersMap = (ordersRaw = []) => {
  const result = {};

  ordersRaw.forEach((order) => {
    const bc = order.barcode;
    if (!result[bc]) result[bc] = [];
    result[bc].push({
      name: order.order_name,
      amount: order.amount,
      date: new Date(order.create_date),
    });
  });

  // Сортируем каждый список по дате
  for (const key in result) {
    result[key].sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  return result;
};

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Трансформирует ответ API в модель приложения
 * @param {Object} apiData — { bc_data: [...], orders: [...] }
 * @returns {{ skuList: SkuItem[], ordersMap: Object }}
 */
export const mapInventoryApiResponse = (apiData) => ({
  skuList: (apiData.bc_data ?? []).map(mapSkuItem),
  ordersMap: mapOrdersMap(apiData.orders),
});
