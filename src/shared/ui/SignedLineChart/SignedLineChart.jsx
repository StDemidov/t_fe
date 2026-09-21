import { memo } from 'react';
import styles from './SignedLineChart.module.css';

const fmt = (value) =>
  (Number(value) || 0).toLocaleString('ru-RU', { maximumFractionDigits: 2 });

/**
 * Линейный график со знаковыми значениями (чистый SVG, без заливки).
 *
 * Отличия от LineChart:
 *  - нет заливки под линией;
 *  - корректно масштабирует положительные и отрицательные значения: нулевая ось
 *    стоит внутри графика, а не всегда внизу (если значения только одного знака —
 *    на соответствующем крае);
 *  - участки линии ниже нуля рисуются красным, выше — основным цветом.
 *
 * @param {object} props
 * @param {Record<string, number>} props.data — объект { дата: значение, … }
 * @param {string|number} [props.summary] — значение для вывода поверх графика
 * @param {string} [props.color='#8254ff'] — цвет положительных участков и точек
 * @param {string} [props.negativeColor='#ff3b3b'] — цвет отрицательных участков
 * @param {string} [props.summaryColor] — цвет сводки (по умолчанию как color)
 * @param {number} [props.height=48] — высота графика в пикселях
 */
const SignedLineChart = memo(function SignedLineChart({
  data = {},
  summary,
  color = '#8254ff',
  negativeColor = '#ff3b3b',
  summaryColor,
  height = 48,
}) {
  const entries = Object.entries(data);

  if (entries.length === 0) {
    return <div className={styles.noData}>Нет данных</div>;
  }

  const values = entries.map(([, value]) => Number(value) || 0);
  if (values.every((v) => v === 0)) {
    return <div className={styles.noData}>Нет данных</div>;
  }

  const minVal = Math.min(0, ...values);
  const maxVal = Math.max(0, ...values);
  const span = maxVal - minVal || 1;

  const W = 1000;
  const H = 200;
  const padX = 3;
  const padTop = 4;
  const padBottom = 4;
  const n = entries.length;

  const toX = (i) => (n === 1 ? W / 2 : padX + (i / (n - 1)) * (W - padX * 2));
  const toY = (v) =>
    padTop + (1 - (v - minVal) / span) * (H - padTop - padBottom);

  const points = entries.map(([label, value], i) => {
    const v = Number(value) || 0;
    return { label, value: v, x: toX(i), y: toY(v) };
  });

  const zeroY = toY(0);

  // Разбиваем линию на положительные и отрицательные участки: на пересечении
  // нуля вставляем точку перехода, чтобы цвет менялся ровно на оси.
  const posRuns = [];
  const negRuns = [];
  let run = null;
  const addPoint = (isPos, pt) => {
    if (run && run.isPos === isPos) {
      run.pts.push(pt);
    } else {
      if (run) (run.isPos ? posRuns : negRuns).push(run.pts);
      run = { isPos, pts: [pt] };
    }
  };

  const crossing = (a, b) => {
    const t = (zeroY - a.y) / (b.y - a.y);
    return { x: a.x + t * (b.x - a.x), y: zeroY, value: 0 };
  };

  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const aPos = a.value >= 0;
    const bPos = b.value >= 0;
    if (aPos === bPos) {
      addPoint(aPos, a);
      addPoint(bPos, b);
    } else {
      const cross = crossing(a, b);
      addPoint(aPos, a);
      addPoint(aPos, cross);
      addPoint(bPos, cross);
      addPoint(bPos, b);
    }
  }
  if (run) (run.isPos ? posRuns : negRuns).push(run.pts);

  const runsToPath = (runs) =>
    runs
      .filter((pts) => pts.length > 1)
      .map((pts) =>
        pts
          .map(
            (p, i) =>
              `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`
          )
          .join(' ')
      )
      .join(' ');

  const posPath = runsToPath(posRuns);
  const negPath = runsToPath(negRuns);

  return (
    <div className={styles.root} style={{ height }}>
      {summary !== undefined && summary !== null && summary !== '' && (
        <div
          className={styles.sumOverlay}
          style={{ color: summaryColor || color }}
        >
          {summary}
        </div>
      )}
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
        {n === 1 ? (
          <circle
            cx={points[0].x}
            cy={points[0].y}
            r="2"
            fill={points[0].value < 0 ? negativeColor : color}
          />
        ) : (
          <>
            {posPath && (
              <path
                d={posPath}
                fill="none"
                stroke={color}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {negPath && (
              <path
                d={negPath}
                fill="none"
                stroke={negativeColor}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </>
        )}
      </svg>
      <div className={styles.points}>
        {points.map((p) => (
          <div key={p.label} className={styles.pointCell}>
            <span
              className={styles.point}
              style={{
                left: `${(p.x / W) * 100}%`,
                top: `${(p.y / H) * 100}%`,
                background: p.value < 0 ? negativeColor : color,
              }}
            />
            <span className={styles.tooltip}>
              <span className={styles.tooltipTitle}>{p.label}</span>
              <span className={styles.tooltipBody}>{fmt(p.value)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default SignedLineChart;
