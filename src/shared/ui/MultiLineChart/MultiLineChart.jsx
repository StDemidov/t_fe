import { memo, useState } from 'react';
import { MdOutlineKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import styles from './MultiLineChart.module.css';

const fmt = (v) =>
  (Number(v) || 0).toLocaleString('ru-RU', { maximumFractionDigits: 2 });

/**
 * Многолинейный график (чистый SVG, без библиотек) для процентных метрик.
 *
 * Без заливки: для каждого датасета своя линия. Сверху — чипы-легенда
 * (клик скрывает/возвращает линию) и строки саммари для каждого датасета:
 * название (цвет линии), значение в % и изменение к прошлому периоду
 * в процентных пунктах (сравнение) — рост зелёным со стрелкой вверх,
 * падение оранжевым со стрелкой вниз. У точек нативный тултип со всеми
 * линиями за эту дату.
 *
 * @param {object} props
 * @param {Array<{
 *   name: string,
 *   color: string,
 *   summary: number,
 *   comparisonSummary?: number,
 *   data: Record<string, number>
 * }>} props.datasets — значения уже в процентах
 * @param {string} [props.changeSuffix='пп.'] — единица изменения к сравнению
 * @param {number} [props.height=48] — высота графика в пикселях
 */
const MultiLineChart = memo(function MultiLineChart({
  datasets = [],
  changeSuffix = 'пп.',
  height = 48,
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
  const withData = shown.filter(
    (d) => d.data && Object.keys(d.data).length > 0
  );

  const legend = datasets.length > 0 && (
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

  if (withData.length === 0) {
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
  withData.forEach((d) =>
    Object.keys(d.data).forEach((date) => {
      if (!seen.has(date)) {
        seen.add(date);
        dates.push(date);
      }
    })
  );

  const hasAny = dates.some((date) =>
    withData.some((d) => (Number(d.data[date]) || 0) !== 0)
  );
  if (!hasAny) {
    return (
      <div className={styles.wrap}>
        {legend}
        <div className={styles.noData}>Нет данных</div>
      </div>
    );
  }

  // Масштаб: максимальная по модулю величина среди всех линий.
  const maxAbs = Math.max(
    1,
    ...withData.flatMap((d) =>
      Object.values(d.data).map((v) => Math.abs(Number(v) || 0))
    )
  );

  const W = 1000;
  const H = 200;
  const padX = 3;
  const padTop = 6;
  const padBottom = 4;
  const n = dates.length;

  const toX = (i) => (n === 1 ? W / 2 : padX + (i / (n - 1)) * (W - padX * 2));
  const toY = (v) => padTop + (1 - Math.abs(v) / maxAbs) * (H - padTop - padBottom);
  const zeroY = toY(0);

  const pointsByDate = dates.map((date, i) => ({
    date,
    x: toX(i),
    values: withData.map((d) => ({
      name: d.name,
      color: d.color,
      value: Number(d.data[date]) || 0,
    })),
  }));

  const paths = withData.map((d) => ({
    ...d,
    path: dates
      .map((date, i) => {
        const v = Number(d.data[date]) || 0;
        const x = toX(i);
        const y = toY(v);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' '),
  }));

  return (
    <div className={styles.wrap}>
      {legend}
      <div className={styles.root} style={{ height }}>
        <div className={styles.sumOverlay}>
          {withData.map((d) => {
            const change =
              d.summary !== undefined && d.summary !== null
                ? (Number(d.summary) || 0) - (Number(d.comparisonSummary) || 0)
                : null;
            return (
              <div key={d.name} className={styles.sumLine}>
                <span className={styles.sumDot} style={{ background: d.color }} />
                <span className={styles.sumValue}>{fmt(d.summary)}%</span>
                {change !== null && (
                  <span
                    className={`${styles.sumChange} ${
                      change >= 0 ? styles.sumChangeUp : styles.sumChangeDown
                    }`}
                  >
                    {change >= 0 ? (
                      <MdOutlineKeyboardArrowUp />
                    ) : (
                      <MdKeyboardArrowDown />
                    )}
                    {change > 0 ? '+' : ''}
                    {fmt(change)} {changeSuffix}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1={zeroY}
            x2={W}
            y2={zeroY}
            className={styles.zeroLine}
            vectorEffect="non-scaling-stroke"
          />
          {paths.map((p) => (
            <path
              key={p.name}
              d={p.path}
              fill="none"
              stroke={p.color}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.75"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <div className={styles.points}>
          {pointsByDate.map((p) => (
            <div key={p.date} className={styles.pointCell}>
              {p.values.map((v) => (
                <span
                  key={v.name}
                  className={styles.point}
                  style={{
                    left: `${(p.x / W) * 100}%`,
                    top: `${(toY(v.value) / H) * 100}%`,
                    background: v.color,
                  }}
                />
              ))}
              <span className={styles.tooltip}>
                <span className={styles.tooltipTitle}>{p.date}</span>
                {p.values.map((v) => (
                  <span key={v.name} className={styles.tooltipLine}>
                    <span className={styles.tooltipName} style={{ color: v.color }}>
                      {v.name}
                    </span>
                    <span className={styles.tooltipBody}>{fmt(v.value)}%</span>
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default MultiLineChart;