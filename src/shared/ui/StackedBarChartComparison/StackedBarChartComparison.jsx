import { memo, useState } from 'react';
import { MdOutlineKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import styles from './StackedBarChartComparison.module.css';

const hexToRgba = (hex, alpha) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const fmt = (value) => (Number(value) || 0).toLocaleString('ru-RU');

// Цвет саммари: отрицательное — красный, положительное и ноль — фиолетовый.
const getSummaryColor = (value) =>
  (Number(value) || 0) < 0 ? '#ff3b3b' : '#623fc0';

/** % изменения к прошлому периоду; null, если прошлое значение 0/нет. */
const pctChange = (current, previous) => {
  const cur = Number(current) || 0;
  const prev = Number(previous) || 0;
  if (prev === 0) return null;
  return ((cur - prev) / prev) * 100;
};

/** Бейдж изменения в %: рост — зелёным со стрелкой вверх, падение — оранжевым. */
const ChangeBadge = ({ change }) =>
  change !== null ? (
    <span
      className={`${styles.sumChange} ${
        change >= 0 ? styles.sumChangeUp : styles.sumChangeDown
      }`}
    >
      {change >= 0 ? <MdOutlineKeyboardArrowUp /> : <MdKeyboardArrowDown />}
      {fmt(Math.abs(change))}%
    </span>
  ) : null;

/**
 * Аналог StackedBarChart: столбчатая диаграмма с несколькими датасетами.
 *
 * Отличие от оригинала: каждый датасет принимает также значение за прошлый
 * период (comparisonSummary). Изменение к прошлому периоду выводится рядом
 * с каждой строкой саммари (и с итогом) — рост зелёным со стрелкой вверх,
 * падение оранжевым со стрелкой вниз, как в мини-плашках страницы товара.
 *
 * Сверху отображается легенда датасетов: клик по ней скрывает/возвращает
 * соответствующий график (столбцы, саммари и итог пересчитываются).
 *
 * @param {object} props
 * @param {Array<{
 *   name: string,
 *   color: string,
 *   negativeColor?: string,
 *   summary: number,
 *   comparisonSummary?: number,
 *   data: Record<string, number>
 * }>} props.datasets
 * @param {number} [props.height=48] — высота графика в пикселях
 * @param {number} [props.total] — итоговая сводка; если не передан, берётся
 *   сумма всех значений датасетов
 */
const StackedBarChartComparison = memo(function StackedBarChartComparison({
  datasets = [],
  height = 48,
  total: totalOverride,
}) {
  const [hidden, setHidden] = useState(() => new Set());

  const toggleDataset = (name) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const shown = datasets.filter((d) => !hidden.has(d.name));
  const nonEmpty = shown.filter(
    (d) => d.data && Object.keys(d.data).length > 0
  );

  // Для единственного датасета чипы не показываем, а вместо итога и строки
  // датасета оставляем одну строку саммари (избегаем дублирования значения).
  const isSingle = datasets.length === 1;

  const legend = datasets.length > 1 && (
    <div className={styles.legend}>
      {datasets.map((d) => (
        <button
          key={d.name}
          type="button"
          className={`${styles.legendItem} ${
            hidden.has(d.name) ? styles.legendItemHidden : ''
          }`}
          onClick={() => toggleDataset(d.name)}
          title={hidden.has(d.name) ? 'Показать' : 'Скрыть'}
        >
          <span className={styles.legendDot} style={{ background: d.color }} />
          {d.name}
        </button>
      ))}
    </div>
  );

  if (nonEmpty.length === 0) {
    return (
      <div className={styles.wrap}>
        {legend}
        <div className={styles.noData}>Нет данных</div>
      </div>
    );
  }

  // Объединение дат по всем датасетам.
  const dates = [];
  const seen = new Set();
  nonEmpty.forEach((d) =>
    Object.keys(d.data).forEach((date) => {
      if (!seen.has(date)) {
        seen.add(date);
        dates.push(date);
      }
    })
  );

  // Полная сумма по всем датасетам — по ней решаем, есть ли данные.
  const dataTotal = nonEmpty.reduce(
    (sum, d) =>
      sum +
      Object.values(d.data).reduce(
        (a, v) => a + (Number(v) || 0),
        0
      ),
    0
  );

  if (dataTotal === 0) {
    return (
      <div className={styles.wrap}>
        {legend}
        <div className={styles.noData}>Нет данных</div>
      </div>
    );
  }

  // Итог: переданный override или полная сумма по датасетам.
  const total =
    totalOverride !== undefined ? Number(totalOverride) || 0 : dataTotal;

  // Сумма значений за прошлый период по всем датасетам и изменение к ней.
  const comparisonTotal = nonEmpty.reduce(
    (sum, d) => sum + (Number(d.comparisonSummary) || 0),
    0
  );
  const totalChange = pctChange(total, comparisonTotal);

  // Суммарные положительная и отрицательная величины по каждой дате.
  const posExt = (date) =>
    nonEmpty.reduce(
      (sum, d) => sum + Math.max(0, Number(d.data[date]) || 0),
      0
    );
  const negExt = (date) =>
    nonEmpty.reduce(
      (sum, d) => sum + Math.min(0, Number(d.data[date]) || 0),
      0
    );

  let maxPos = 0;
  let maxNeg = 0;
  dates.forEach((date) => {
    maxPos = Math.max(maxPos, posExt(date));
    maxNeg = Math.max(maxNeg, -negExt(date));
  });
  const hasNeg = maxNeg > 0;
  // Линейное масштабирование: ось 0Y строится по сумме всех датасетов на дату,
  // а не по максимальному из них, — столбцы не выходят за пределы. Размеры зон
  // пропорциональны суммарным максимумам.
  const sumAbs = maxPos + maxNeg;
  const zonePos = sumAbs > 0 ? (maxPos / sumAbs) * 100 : 100;
  const zoneNeg = hasNeg ? 100 - zonePos : 0;
  const zeroBottom = hasNeg ? zoneNeg : 0;

  // Отступ между столбцами уменьшается с ростом числа точек.
  const gap =
    dates.length > 40 ? 0 : dates.length > 20 ? 1 : dates.length > 10 ? 2 : 3;

  return (
    <div className={styles.wrap}>
      {legend}
      <div className={styles.root} style={{ height, gap }}>
        <div className={styles.sumOverlay}>
          {hidden.size === 0 && !isSingle && (
            <div className={styles.sumTotalRow}>
              <div
                className={styles.sumTotal}
                style={{ color: getSummaryColor(total) }}
              >
                {fmt(total)}
              </div>
              <ChangeBadge change={totalChange} />
            </div>
          )}
          {nonEmpty.map((d) => (
            <div
              key={d.name}
              className={`${styles.sumLine} ${
                isSingle ? styles.sumLineSingle : ''
              }`}
            >
              {!isSingle && (
                <span
                  className={styles.sumName}
                  style={{ color: getSummaryColor(d.summary) }}
                >
                  {d.name}
                </span>
              )}
              <span
                className={styles.sumValue}
                style={{ color: getSummaryColor(d.summary) }}
              >
                {fmt(d.summary)}
              </span>
              <ChangeBadge change={pctChange(d.summary, d.comparisonSummary)} />
            </div>
          ))}
        </div>
        {hasNeg && (
          <div className={styles.zeroLine} style={{ bottom: `${zeroBottom}%` }} />
        )}
        {dates.map((date) => {
          let posCum = 0;
          let negCum = 0;
          return (
            <div key={date} className={styles.barCell}>
              <span className={styles.tooltip}>
                <span className={styles.tooltipTitle}>{date}</span>
                {nonEmpty.map((d) => (
                  <span key={d.name} className={styles.tooltipLine}>
                    <span className={styles.tooltipName} style={{ color: d.color }}>
                      {d.name}
                    </span>
                    <span className={styles.tooltipBody}>{fmt(d.data[date])}</span>
                  </span>
                ))}
              </span>
              {nonEmpty.map((d) => {
                const num = Number(d.data[date]) || 0;
                if (num === 0) return null;
                if (num > 0) {
                  const h = maxPos > 0 ? zonePos * (num / maxPos) : 0;
                  const el = (
                    <div
                      key={d.name}
                      className={styles.segment}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: `${h}%`,
                        bottom: `${zeroBottom + posCum}%`,
                        background: hexToRgba(d.color, 0.85),
                      }}
                    />
                  );
                  posCum += h;
                  return el;
                }
                const h = maxNeg > 0 ? zoneNeg * (-num / maxNeg) : 0;
                const segColor = d.negativeColor || d.color;
                const el = (
                  <div
                    key={d.name}
                    className={styles.segment}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: `${h}%`,
                      bottom: `${zeroBottom - negCum - h}%`,
                      background: hexToRgba(segColor, 0.85),
                    }}
                  />
                );
                negCum += h;
                return el;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default StackedBarChartComparison;