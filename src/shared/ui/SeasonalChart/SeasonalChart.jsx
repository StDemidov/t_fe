import styles from './SeasonalChart.module.css';

const W = 1000;
const H = 200;
const PAD_X = 50;
const PAD_TOP = 14;
const PAD_BOTTOM = 8;
const LABELS_H = 36;

const GREEN = 'var(--color-status-success-primary)';
const RED = 'var(--color-status-error-primary)';

const ddMm = (date) =>
  `${String(date.getDate()).padStart(2, '0')}.${String(
    date.getMonth() + 1
  ).padStart(2, '0')}`;

/**
 * Дата начала недели года (с 1 января текущего года).
 * Неделя 0 — с 1 по 4 января; каждая следующая — 7 дней.
 */
const weekStartOffset = (weekIdx) => (weekIdx === 0 ? 0 : 7 * weekIdx - 3);

/** Диапазон недели по её индексу в виде «01.01 - 04.01». */
const weekRange = (weekIdx) => {
  const jan1 = new Date(new Date().getFullYear(), 0, 1);
  const start = new Date(jan1);
  start.setDate(jan1.getDate() + weekStartOffset(weekIdx));
  const end = new Date(start);
  end.setDate(start.getDate() + (weekIdx === 0 ? 3 : 6));
  return `${ddMm(start)} - ${ddMm(end)}`;
};

/** Индекс недели, в которую попадает дата (неделя 0 — с 1 по 4 января). */
const weekIndexOf = (date) => {
  const jan1 = new Date(date.getFullYear(), 0, 1);
  const diffDays = Math.round((date - jan1) / (24 * 60 * 60 * 1000));
  return Math.floor((diffDays + 3) / 7);
};

const fmtNum = (v) =>
  v.toLocaleString('ru-RU', { maximumFractionDigits: 2 });

/** Метки шкалы 0Y: минимум, 1, максимум и середины промежутков. */
const buildTicks = (minV, maxV, base) => {
  const candidates = [
    minV,
    base,
    maxV,
    (minV + base) / 2,
    (base + maxV) / 2,
  ];
  const unique = new Set(candidates.map((v) => Number(v.toFixed(2))));
  return [...unique]
    .filter((v) => v >= minV - 1e-9 && v <= maxV + 1e-9)
    .sort((a, b) => a - b);
};

/**
 * Сезонный график (чистый SVG, без библиотек): коэффициенты сезонности
 * по неделям года (значение из индекса i — неделя i года).
 *
 * По оси 0X — диапазоны дат недель (вертикальные подписи, прорежены).
 * По оси 0Y — шкала коэффициентов и фиолетовая базовая линия на уровне 1:
 * участки графика ниже неё — красные, выше — зелёные. На текущей неделе —
 * красная вертикальная линия с подписью «текущая неделя» (линия не доходит
 * до подписей недель, чтобы в них не врезаться). У каждой точки — тултип:
 * сверху диапазон недели, ниже значение коэффициента.
 *
 * @param {object} props
 * @param {number[]} [props.data=[]] — коэффициенты по неделям года
 * @param {number} [props.height=118] — высота графика (с подписями недель)
 */
const SeasonalChart = ({ data = [], height = 118 }) => {
  const values = (Array.isArray(data) ? data : []).map((v) => Number(v) || 0);

  if (values.length === 0) {
    return <div className={styles.noData}>Нет данных</div>;
  }

  const n = values.length;
  const base = 1;

  let minV = Math.min(...values, base);
  let maxV = Math.max(...values, base);
  const pad = (maxV - minV) * 0.15 || 0.1;
  minV -= pad;
  maxV += pad;
  const span = maxV - minV || 1;

  const toX = (i) => (n === 1 ? W / 2 : PAD_X + (i / (n - 1)) * (W - PAD_X * 2));
  const toY = (v) =>
    PAD_TOP + (1 - (v - minV) / span) * (H - PAD_TOP - PAD_BOTTOM);
  const baseY = toY(base);

  // Сегменты линии: середина выше базы — зелёная, ниже — красная.
  let greenPath = '';
  let redPath = '';
  for (let i = 0; i + 1 < n; i++) {
    const seg = `M${toX(i).toFixed(2)},${toY(values[i]).toFixed(2)}L${toX(
      i + 1
    ).toFixed(2)},${toY(values[i + 1]).toFixed(2)}`;
    if ((values[i] + values[i + 1]) / 2 >= base) greenPath += ` ${seg}`;
    else redPath += ` ${seg}`;
  }
  greenPath = greenPath.trim();
  redPath = redPath.trim();

  // Текущая неделя: вертикальная красная линия на её отметке 0X. Заканчивается
  // с отступом выше подписей недель, чтобы не врезаться в них.
  const now = new Date();
  const todayX = toX(Math.min(weekIndexOf(now), n - 1));
  const todayBottom = H - LABELS_H - 2;
  const todayPct = (todayX / W) * 100;
  const labelLeft = Math.min(92, Math.max(8, todayPct));
  const labelStep = 4;

  const ticks = buildTicks(minV, maxV, base);

  return (
    <div className={styles.root} style={{ height }}>
      <div className={styles.plotLayer}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
        >
          <line
            x1={PAD_X}
            y1={baseY}
            x2={W - PAD_X}
            y2={baseY}
            className={styles.baseLine}
            vectorEffect="non-scaling-stroke"
          />
          {redPath && (
            <path
              d={redPath}
              className={styles.segRed}
              vectorEffect="non-scaling-stroke"
            />
          )}
          {greenPath && (
            <path
              d={greenPath}
              className={styles.segGreen}
              vectorEffect="non-scaling-stroke"
            />
          )}
          {n === 1 && (
            <circle
              cx={toX(0)}
              cy={toY(values[0])}
              r="3.5"
              fill={values[0] >= base ? GREEN : RED}
            />
          )}
          <line
            x1={todayX}
            y1={PAD_TOP}
            x2={todayX}
            y2={todayBottom}
            className={styles.todayLine}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <span className={styles.todayLabel} style={{ left: `${labelLeft}%` }}>
          текущая неделя
        </span>

        <div className={styles.yAxis}>
          {ticks.map((v) => (
            <span
              key={v}
              className={styles.yTick}
              style={{ top: `${(toY(v) / H) * 100}%` }}
            >
              {fmtNum(v)}
            </span>
          ))}
        </div>

        <div className={styles.points}>
          {values.map((v, i) => {
            const yPct = (toY(v) / H) * 100;
            return (
              <div
                key={i}
                className={styles.pointCell}
                style={{
                  left: `${(toX(i) / W) * 100}%`,
                  top: `${yPct}%`,
                }}
              >
                <span
                  className={styles.point}
                  style={{ background: v >= base ? GREEN : RED }}
                />
                <span
                  className={`${styles.tooltip} ${
                    yPct < 28 ? styles.tooltipBelow : ''
                  }`}
                >
                  <span className={styles.tooltipTitle}>{weekRange(i)}</span>
                  <span className={styles.tooltipBody}>{fmtNum(v)}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.weekLabels}>
        {values.map((v, i) => {
          if (i % labelStep !== 0 && i !== n - 1) return null;
          return (
            <span
              key={i}
              className={styles.weekLabel}
              style={{ left: `${(toX(i) / W) * 100}%` }}
            >
              {weekRange(i)}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default SeasonalChart;