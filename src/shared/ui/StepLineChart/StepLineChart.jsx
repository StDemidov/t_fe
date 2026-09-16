import { memo, useMemo } from 'react';
import styles from './StepLineChart.module.css';

/**
 * Ступенчатый линейный график (чистый SVG, без библиотек), без заливки.
 *
 * Линия идёт «ступеньками»: горизонтальный отрезок к следующей дате, затем
 * вертикальный — к значению. Поверх графика показывается сводка (summary),
 * скрывается при наведении; у каждой точки свой нативный тултип (дата:
 * значение). Значения откладываются по датам.
 *
 * @param {object} props
 * @param {Record<string, number|null>} props.data — объект { дата: значение, … }
 * @param {string|number} [props.summary] — значение для вывода поверх графика
 * @param {string} [props.color='#8254ff'] — цвет линии и точек
 * @param {number} [props.height=48] — высота графика в пикселях
 */
const StepLineChart = memo(function StepLineChart({
  data = {},
  summary,
  color = '#8254ff',
  height = 48,
}) {
  const entries = Object.entries(data);

  if (entries.length === 0) {
    return <div className={styles.noData}>Нет данных</div>;
  }

  // Уникальные точки для проверки «все нули».
  const hasAny = useMemo(
    () => entries.some(([, value]) => (Number(value) || 0) !== 0),
    [entries]
  );

  if (!hasAny) {
    return <div className={styles.noData}>Нет данных</div>;
  }

  const values = entries.map(([, value]) => Number(value) || 0);
  const maxAbs = Math.max(...values.map((v) => Math.abs(v)), 1);

  const W = 1000;
  const H = 200;
  const padX = 3;
  const padTop = 4;
  const padBottom = 4;
  const n = entries.length;

  const toX = (i) => (n === 1 ? W / 2 : padX + (i / (n - 1)) * (W - padX * 2));
  const toY = (v) => padTop + (1 - Math.abs(v) / maxAbs) * (H - padTop - padBottom);

  const points = entries.map(([label, value], i) => ({
    label,
    value: Number(value) || 0,
    x: toX(i),
    y: toY(Number(value) || 0),
  }));

  const zeroY = toY(0);

  // Ступенчатая линия: горизонтально к следующей дате, вертикально к значению.
  const stepPath = points
    .map((p, i) => {
      if (i === 0) return `M${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      const prev = points[i - 1];
      return (
        `L${p.x.toFixed(2)},${prev.y.toFixed(2)} ` +
        `L${p.x.toFixed(2)},${p.y.toFixed(2)}`
      );
    })
    .join(' ');

  const fmt = (v) => v.toLocaleString('ru-RU', { maximumFractionDigits: 2 });

  return (
    <div className={styles.root} style={{ height }}>
      {summary !== undefined && (
        <div className={styles.sumOverlay}>{summary}</div>
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
        <path
          d={stepPath}
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className={styles.points}>
        {points.map((p) => (
          <div key={p.label} className={styles.pointCell}>
            <span
              className={styles.point}
              style={{
                left: `${(p.x / W) * 100}%`,
                top: `${(p.y / H) * 100}%`,
                background: color,
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

export default StepLineChart;