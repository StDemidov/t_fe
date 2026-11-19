import { useMemo } from 'react';
import { ProductImage, BarChart } from '../../../shared/ui';
import { SkuStatsBlock } from '../../product-cards';
import {
  getCardStats,
  getSkuStats,
  mergeDaily,
  sortSkusByMetric,
  ABC_ORDER,
} from '../../../entities/product-card';
import styles from './CardSkusBlock.module.css';

const fmtAmount = (value) =>
  value.toLocaleString('ru-RU', { maximumFractionDigits: 1 });

/** Дата 'YYYY-MM-DD' → 'дд.мм' (как в ProductCardWidget). */
const fmtDayMonth = (date) => `${date.slice(8, 10)}.${date.slice(5, 7)}`;

/** Таймсерия {'YYYY-MM-DD': число|null} → {'дд.мм': число} для графика. */
const buildDailyData = (daily) => {
  const data = {};
  for (const date of Object.keys(daily || {}).sort()) {
    data[fmtDayMonth(date)] = Number(daily[date]) || 0;
  }
  return data;
};

/**
 * Элемент skusInCardMetrics ответа card_metrics → форма данных «Карточек
 * товаров» (entities/product-card): дневные поля — таймсериями, остатки —
 * суммой FBW/FBS, кампаний в ответе нет.
 */
const normalizeCardSku = (item) => ({
  sku: item.sku,
  vendorcode: item.vendorCode,
  image: item.image,
  abc: item.abcAmongAllCurrent,
  abcInCategory: item.abcAmongCategoryCurrent,
  stocks: (Number(item.stocksFbwLast) || 0) + (Number(item.stocksFbsLast) || 0),
  ordersDaily: mergeDaily([item.ordersFbw, item.ordersFbs]),
  clicksDaily: item.clicks,
  addingsToCartDaily: item.addingsToCart,
  adsCostsDaily: item.adsCosts,
});

/**
 * Блок «Товары в карточке» внизу страницы товара: одна горизонтальная строка
 * товаров карточки, статистика каждого раскрыта всегда (без toggle). Слева —
 * «прибитая» панель суммарных графиков, при горизонтальном скролле товары
 * заезжают под неё. Данные — card_metrics за фиксированные 14 дней; если SKU
 * один в карточке, бекенд возвращает {} и блок не рендерится.
 *
 * @param {object} props
 * @param {object} props.cardMetrics — ответ /get_db_data/card_metrics
 * @param {string|number} [props.currentSku] — текущий SKU (рамка-подсветка)
 */
const CardSkusBlock = ({ cardMetrics, currentSku }) => {
  const rows = useMemo(() => {
    const list = Array.isArray(cardMetrics?.skusInCardMetrics)
      ? cardMetrics.skusInCardMetrics
      : [];
    const mapped = list.map(normalizeCardSku);
    return sortSkusByMetric(
      mapped.map((sku) => ({ ...sku, stats: getSkuStats(sku) })),
      'clicks:desc'
    );
  }, [cardMetrics]);

  const stats = useMemo(() => getCardStats(rows), [rows]);

  const daily = useMemo(
    () => ({
      orders: buildDailyData(stats.ordersDaily),
      clicks: buildDailyData(stats.clicksDaily),
      ads: buildDailyData(stats.adsCostsDaily),
    }),
    [stats]
  );

  // SKU один в карточке (ответ {}) — блока нет.
  if (rows.length === 0) return null;

  const chips = Object.keys(stats.abcCounts)
    .filter((abc) => stats.abcCounts[abc] > 0)
    .sort((a, b) => {
      const ia = ABC_ORDER.indexOf(a);
      const ib = ABC_ORDER.indexOf(b);
      return (
        (ia === -1 ? ABC_ORDER.length : ia) -
          (ib === -1 ? ABC_ORDER.length : ib) || a.localeCompare(b)
      );
    });

  // Рисуем только графики, у которых есть данные (сумма не ноль).
  const charts = [
    {
      key: 'orders',
      label: 'Заказы',
      data: daily.orders,
      summary: fmtAmount(stats.totalOrders),
    },
    {
      key: 'clicks',
      label: 'Клики',
      data: daily.clicks,
      summary: fmtAmount(stats.totalClicks),
    },
    {
      key: 'ads',
      label: 'Рекламные расходы',
      data: daily.ads,
      summary: `${fmtAmount(stats.totalAdsCosts)} ₽`,
    },
  ].filter((chart) =>
    Object.values(chart.data).some((value) => Number(value) !== 0)
  );

  return (
    <section className={styles.root}>
      <div className={styles.head}>
        <h2 className={styles.title}>Товары в карточке (14 дней)</h2>
        <span className={styles.countBadge}>{rows.length} SKU</span>
      </div>
      <div className={styles.scroll}>
        <div className={styles.row}>
          <div className={styles.totals}>
            <div className={styles.abcRow}>
              {chips.map((abc) => (
                <span
                  key={abc}
                  className={`${styles.abcChip} ${
                    styles[`abc_${abc.toLowerCase()}`] || ''
                  }`}
                >
                  {abc} · {stats.abcCounts[abc]}
                </span>
              ))}
            </div>
            <div className={styles.charts}>
              {charts.map((chart) => (
                <div className={styles.chartBlock} key={chart.key}>
                  <span className={styles.chartLabel}>{chart.label}</span>
                  <BarChart data={chart.data} summary={chart.summary} />
                </div>
              ))}
            </div>
            <div className={styles.brief}>
              <div className={styles.briefRow}>
                <span>Заказы</span>
                <b>{fmtAmount(stats.totalOrders)}</b>
              </div>
              <div className={styles.briefRow}>
                <span>Клики</span>
                <b>{fmtAmount(stats.totalClicks)}</b>
              </div>
              <div className={styles.briefRow}>
                <span>Рекламные расходы</span>
                <b>{fmtAmount(stats.totalAdsCosts)} ₽</b>
              </div>
            </div>
          </div>

          {rows.map((item) => {
            const isCurrent = String(item.sku) === String(currentSku);
            return (
              <div
                key={item.sku}
                className={`${styles.skuCell} ${
                  isCurrent ? styles.skuCellCurrent : ''
                }`}
              >
                <ProductImage
                  src={item.image}
                  size={104}
                  alt={item.vendorcode}
                  abc={item.abc}
                  abcInCategory={item.abcInCategory}
                  sku={item.sku}
                  noStock={item.stocks === 0}
                  linkable={!isCurrent}
                />
                <SkuStatsBlock sku={item} open large />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CardSkusBlock;
