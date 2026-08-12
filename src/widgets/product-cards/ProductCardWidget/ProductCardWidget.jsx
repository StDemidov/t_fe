import { memo, useMemo, useState } from 'react';
import { MdOutlineMoreVert, MdRefresh } from 'react-icons/md';
import { ProductImage, BarChart } from '../../../shared/ui';
import SkuStatsBlock from '../SkuStatsBlock';
import {
  getCardStats,
  getSkuStats,
  sortSkusByMetric,
  ABC_ORDER,
} from '../../../entities/product-card';
import wbLogo from '../../../shared/assets/wb_logo.png';
import styles from './ProductCardWidget.module.css';

const fmtAmount = (value) =>
  value.toLocaleString('ru-RU', { maximumFractionDigits: 1 });

/** Строит объект { дата: значение } из дневного списка (последние N дней, до вчера). */
const buildDailyData = (list) => {
  const data = {};
  const base = new Date();
  base.setDate(base.getDate() - 1);
  for (let i = 0; i < list.length; i++) {
    const date = new Date(base);
    date.setDate(base.getDate() - (list.length - 1 - i));
    const key = `${String(date.getDate()).padStart(2, '0')}.${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;
    data[key] = list[i];
  }
  return data;
};

/**
 * Карточка товара на холсте: плашки номера и количества, блок с информацией
 * (плашки ABC, заказы, клики, реклама, ДРР) и сетка товаров.
 * Информация лежит в отдельном блоке выше всех фоток.
 * memo — чтобы пан/зум холста не перерисовывал содержимое карточек.
 * @param {object} props
 * @param {{ id: number, skus: Array<object> }} props.group
 * @param {string} [props.skuSort] — сортировка артикулов внутри карточки
 */
const ProductCardWidget = memo(function ProductCardWidget({
  group,
  skuSort = 'clicks:desc',
}) {
  const [expanded, setExpanded] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => getCardStats(group.skus), [group.skus]);
  const daily = useMemo(
    () => ({
      orders: buildDailyData(stats.ordersDaily),
      clicks: buildDailyData(stats.clicksDaily),
      ads: buildDailyData(stats.adsCostsDaily),
    }),
    [stats]
  );
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

  // Статистика по каждому артикулу (для блоков под фотографиями)
  // и сортировка по выбранному типу (значение «метрика:направление»).
  const skuRows = useMemo(
    () =>
      sortSkusByMetric(
        group.skus.map((sku) => ({ ...sku, stats: getSkuStats(sku) })),
        skuSort
      ),
    [group.skus, skuSort]
  );

  const firstSku = skuRows[0]?.sku;
  const firstCategory = skuRows[0]?.category;
  const outOfStock = stats.totalStock === 0;

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
  const hasCharts = charts.length > 0;

  // Переключает расширенную статистику (графики) с плавным появлением/схлопыванием.
  const toggleStats = () => {
    setExpanded((value) => !value);
  };

  // Перезагружает фотографии карточки (новый токен пересоздаёт <img>).
  const handleRefresh = () => {
    setRefreshToken((token) => token + 1);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div
      className={`${styles.root} ${outOfStock ? styles.outOfStock : ''} ${
        expanded ? styles.infoOpen : ''
      }`}
    >
      <header className={styles.header}>
        <span className={styles.badge}>{group.skus.length} SKU</span>
        <div className={styles.headerRight}>
          <a
            className={styles.wbLink}
            href={`https://www.wildberries.ru/catalog/${firstSku}/detail.aspx`}
            target="_blank"
            rel="noopener noreferrer"
            title="Открыть товар на Wildberries"
          >
            <img className={styles.wbLogo} src={wbLogo} alt="WB" />
          </a>
          <button
            type="button"
            className={styles.moreButton}
            onClick={handleRefresh}
            aria-label="Перезагрузить фото"
            title="Перезагрузить фото"
          >
            <MdRefresh
              className={refreshing ? styles.refreshingIcon : undefined}
              size={18}
            />
          </button>
          {hasCharts && (
            <button
              type="button"
              className={`${styles.moreButton} ${
                expanded ? styles.moreButtonActive : ''
              }`}
              onClick={toggleStats}
              aria-expanded={expanded}
              aria-label="Расширенная статистика"
              title="Расширенная статистика"
            >
              <MdOutlineMoreVert size={18} />
            </button>
          )}
        </div>
      </header>
      <div className={styles.info}>
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
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Категория</span>
          <span className={styles.metricCategory}>{firstCategory || '—'}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>ДРР (7д.)</span>
          <span className={styles.metricValue}>
            {stats.drr === null ? '—' : `${(stats.drr * 100).toFixed(1)}%`}
          </span>
        </div>
        <div className={styles.statsArea}>
          <div className={styles.chartsPanel}>
            {charts.map((chart) => (
              <div className={styles.chartBlock} key={chart.key}>
                <span className={styles.metricLabel}>{chart.label}</span>
                <BarChart data={chart.data} summary={chart.summary} />
              </div>
            ))}
          </div>
          <div className={styles.brief}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Заказы (7д.)</span>
              <span className={styles.metricValue}>
                {fmtAmount(stats.totalOrders)}
              </span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Клики (7д.)</span>
              <span className={styles.metricValue}>
                {fmtAmount(stats.totalClicks)}
              </span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>
                Рекламные расходы (7д.)
              </span>
              <span className={styles.metricValue}>
                {fmtAmount(stats.totalAdsCosts)} ₽
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.grid}>
        {skuRows.map((item, index) => (
          <div className={styles.skuCell} key={`${item.sku}-${index}`}>
            <div className={styles.skuImageWrap}>
              <ProductImage
                src={item.image}
                size={74}
                alt={item.vendorcode}
                abc={item.abc}
                abcInCategory={item.abcInCategory}
                sku={item.sku}
                skuId={item.id}
                noStock={item.stocks === 0}
                refreshToken={refreshToken}
              />
            </div>
            <SkuStatsBlock sku={item} open={expanded} />
          </div>
        ))}
      </div>
    </div>
  );
});

export default ProductCardWidget;
