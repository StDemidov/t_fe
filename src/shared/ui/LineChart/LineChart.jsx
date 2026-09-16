import { memo, useMemo } from 'react';
import { MdOutlineKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import styles from './LineChart.module.css';

/**
 * Линейный график (чистый SVG, без библиотек) для процентных метрик.
 *
 * По стилю повторяет BarChart: поверх графика показывается сводка (summary),
 * которая скрывается при наведении; у каждой точки свой нативный тултип
 * (дата: значение). Значения откладываются по датам.
 *
 * @param {object} props
 * @param {Record<string, number>} props.data — объект { дата: значение, … }
 * @param {string|number} [props.summary] — значение для вывода поверх графика
 * @param {string} [props.color='#8254ff'] — цвет линии и точек
 * @param {string} [props.benchmarkColor='#f59e0b'] — цвет линии бенчмарка
 * @param {number} [props.benchmark] — значение горизонтальной линии
 *   бенчмарка (одно значение на все даты); его же показываем и в тултипе
 * @param {boolean} [props.percent=false] — данные хранятся в долях (0–1);
 *   тогда значения и бенчмарк в тултипе умножаются на 100
 * @param {number} [props.change] — изменение к прошлому периоду (например,
 *   в процентных пунктах); выводится рядом со сводкой. Положительное — зелёным
 *   со стрелкой вверх, отрицательное — оранжевым со стрелкой вниз
 * @param {string} [props.changeSuffix='пп.'] — единица измерения изменения
 * @param {number} [props.height=48] — высота графика в пикселях
 */
const LineChart = memo(function LineChart({
  data = {},
  summary,
  color = '#8254ff',
  benchmarkColor = '#f59e0b',
  benchmark,
  percent = false,
  change,
  changeSuffix = 'пп.',
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
  const benchmarkVal = Number(benchmark) || 0;
  // Бенчмарк участвует в масштабе, чтобы линия легла по той же оси, что и данные.
  const maxAbs = Math.max(
    ...values.map((v) => Math.abs(v)),
    Math.abs(benchmarkVal),
    1
  );

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
  const benchY = benchmark ? toY(benchmarkVal) : null;
  const hasBench = benchmark !== undefined && benchmark !== null && benchmark !== '';

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(' ');

  // Заполнение под линией (лёгкий градиент к прозрачности).
  const areaPath =
    n === 1
      ? `M${points[0].x.toFixed(2)},${(H - padBottom).toFixed(2)}L${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}V${(H - padBottom).toFixed(2)}Z`
      : `${linePath} L${W - padX},${H - padBottom} L${padX},${H - padBottom} Z`;

  const fmt = (v) => v.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
  const toDisplay = (v) => (percent ? v * 100 : v);

  return (
    <div className={styles.root} style={{ height }}>
      {summary !== undefined && (
        <div className={styles.sumOverlay}>
          <span className={styles.sumRow}>
            {summary}
            {change !== undefined && change !== null && (
              <span
                className={`${styles.sumChange} ${
                  Number(change) >= 0 ? styles.sumChangeUp : styles.sumChangeDown
                }`}
              >
                {Number(change) >= 0 ? (
                  <MdOutlineKeyboardArrowUp />
                ) : (
                  <MdKeyboardArrowDown />
                )}
                {Number(change) > 0 ? '+' : ''}
                {fmt(Number(change))} {changeSuffix}
              </span>
            )}
          </span>
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
        {hasBench && benchY !== null && (
          <line
            x1="0"
            y1={benchY}
            x2={W}
            y2={benchY}
            className={styles.benchmarkLine}
            vectorEffect="non-scaling-stroke"
          />
        )}
        <path d={areaPath} fill={color} opacity="0.12" />
        <path
          d={linePath}
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
            <span className={styles.point}
              style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%`, background: color }}
            />
            <span className={styles.tooltip}>
              <span className={styles.tooltipTitle}>{p.label}</span>
              <span className={styles.tooltipBody}>
                {fmt(toDisplay(p.value))}
                {hasBench && (
                  <>
                    <span className={styles.tooltipBenchDivider}> · </span>
                    <span
                      className={styles.tooltipBench}
                      style={{ color: benchmarkColor }}
                    >
                      {fmt(toDisplay(benchmarkVal))}
                    </span>
                  </>
                )}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default LineChart;
