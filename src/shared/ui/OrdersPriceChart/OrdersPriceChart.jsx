import { memo } from 'react';
import styles from './OrdersPriceChart.module.css';

const fmt = (v) => (v ?? 0).toLocaleString('ru-RU');

/**
 * Совмещённый график «Заказы + Цена» на одном полотне.
 *
 * Столбчатые — заказы (orders), поверх них красной линией — цены (price).
 * Ось дат — объединение обоих датасетов, поэтому линия рисуется во все даты,
 * где у price есть значения (даже если их нет у orders). Каждая серия
 * масштабируется по своей максимуме. Поверх графика показывается сводка
 * (summary), которая скрывается при наведении. Тултип у каждого столбца:
 * дата сверху, ниже «Заказы: …», ещё ниже «Цена: …».
 *
 * @param {object} props
 * @param {Record<string, number>} [props.orders={}] — датасет заказов { дата: значение, … }
 * @param {Record<string, number>} [props.price={}] — датасет цен { дата: значение, … }
 * @param {string|number} [props.summary] — значение для вывода поверх графика (заказы)
 * @param {string} [props.barColor='#6c63ff'] — цвет столбцов заказов
 * @param {string} [props.lineColor='#ef4444'] — цвет линии цен
 * @param {number} [props.height=48] — высота графика в пикселях
 */
const OrdersPriceChart = memo(function OrdersPriceChart({
  orders = {},
  price = {},
  summary,
  barColor = '#6c63ff',
  lineColor = '#ef4444',
  height = 48,
}) {
  // Общая ось дат — объединение ключей заказов и цен (ISO-даты сортируются).
  const keys = [...new Set([...Object.keys(orders), ...Object.keys(price)])].sort();

  const values = keys.map((k) => Number(orders[k]) || 0);

  // Точки линии — по всем датам, где цена есть.
  const pricePoints = keys
    .map((label, i) => ({
      label,
      i,
      v: price[label],
    }))
    .filter((p) => p.v !== undefined && p.v !== null && p.v !== '' && !isNaN(Number(p.v)))
    .map((p) => ({ ...p, value: Number(p.v) }));

  const hasAnyOrders = values.some((v) => v !== 0);
  const hasAnyPrice = pricePoints.length > 0;

  if (keys.length === 0 || (!hasAnyOrders && !hasAnyPrice)) {
    return <div className={styles.noData}>Нет данных</div>;
  }

  const maxOrders = Math.max(...values, 1);
  const maxPrice = Math.max(...pricePoints.map((p) => Math.abs(p.value)), 1);
  const n = keys.length;

  // Линия рисуется в SVG, растянутом на весь график.
  const W = 1000;
  const H = 200;
  const padX = 3;
  const padTop = 4;
  const padBottom = 4;

  const toX = (i) => (n === 1 ? W / 2 : ((i + 0.5) / n) * W);
  const yFor = (v) =>
    padTop + (1 - Math.abs(v) / maxPrice) * (H - padTop - padBottom);

  const linePath = pricePoints
    .map(
      (p, idx) =>
        `${idx === 0 ? 'M' : 'L'}${toX(p.i).toFixed(2)},${yFor(p.value).toFixed(2)}`
    )
    .join(' ');

  // Отступ между столбцами убывает с ростом числа точек.
  const gap = n > 40 ? 0 : n > 20 ? 1 : n > 10 ? 2 : 3;

  return (
    <div className={styles.root} style={{ height, gap }}>
      {summary !== undefined && (
        <div className={styles.sumOverlay}>{summary}</div>
      )}

      <svg
        className={styles.lineLayer}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        {pricePoints.length >= 2 && (
          <path
            d={linePath}
            fill="none"
            stroke={lineColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {pricePoints.length === 1 && (
          <circle
            cx={toX(pricePoints[0].i)}
            cy={yFor(pricePoints[0].value)}
            r="6"
            fill={lineColor}
          />
        )}
      </svg>

      {keys.map((label, i) => {
        const num = values[i];
        const pct = maxOrders > 0 ? (num / maxOrders) * 100 : 0;
        const rawPrice = price[label];
        const priceMissing =
          rawPrice === undefined || rawPrice === null || rawPrice === '' || isNaN(Number(rawPrice));
        return (
          <div key={label} className={styles.barCell}>
            <span className={styles.tooltip}>
              <span className={styles.tooltipTitle}>{label}</span>
              <span className={styles.tooltipBody}>
                <span className={styles.tooltipRow}>Заказы: {fmt(num)}</span>
                <span
                  className={styles.tooltipRow}
                  style={{ color: lineColor }}
                >
                  Цена: {priceMissing ? '—' : fmt(Number(rawPrice))}
                </span>
              </span>
            </span>
            <div
              className={styles.bar}
              style={{
                height: `${pct}%`,
                background: `${barColor}b3`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
});

export default OrdersPriceChart;