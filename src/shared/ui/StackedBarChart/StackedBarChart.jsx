import { memo } from 'react';
import styles from './StackedBarChart.module.css';

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

/**
 * Столбчатая диаграмма с несколькими датасетами.
 *
 * Основана на BarChart, но в отличие от него принимает несколько датасетов с
 * одинаковой структурой { дата: значение }. Для каждой даты столбец делится по
 * цветам — по одному сегменту на датасет (стек сверху вниз в порядке передачи).
 *
 * Поверх графика выводятся сводки: для каждого датасета строка «название —
 * значение», ниже — общая сумма всех датасетов. Тултип на столбце показывает
 * значение по каждому датасету за эту дату.
 *
 * @param {object} props
 * @param {Array<{ name: string, color: string, summary: number, data: Record<string, number> }>} props.datasets
 * @param {number} [props.height=48] — высота графика в пикселях
 * @param {number} [props.total] — итоговая сводка; если не передан, берётся
 *   сумма всех значений датасетов
 */
const StackedBarChart = memo(function StackedBarChart({
  datasets = [],
  height = 48,
  total: totalOverride,
}) {
  const nonEmpty = datasets.filter(
    (d) => d.data && Object.keys(d.data).length > 0
  );

  if (nonEmpty.length === 0) {
    return <div className={styles.noData}>Нет данных</div>;
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
    return <div className={styles.noData}>Нет данных</div>;
  }

  // Своден итог: переданный override или полная сумма по датасетам.
  const total =
    totalOverride !== undefined ? Number(totalOverride) || 0 : dataTotal;

  // Логарифмическое масштабирование: log10(1 + |x|) сжимает крупные значения,
  // чтобы они не выходили за пределы графика.
  const logVal = (x) => Math.log10(1 + x);

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
  // Размеры положительной и отрицательной зон пропорциональны логарифмам
  // максимальных суммарных величин — всё гарантированно помещается.
  const logPos = logVal(Math.max(1, maxPos));
  const logNeg = logVal(Math.max(1, maxNeg));
  const denom = logPos + logNeg;
  const zonePos = (logPos / denom) * 100;
  const zoneNeg = (logNeg / denom) * 100;
  const zeroBottom = hasNeg ? zoneNeg : 0;

  // Отступ между столбцами уменьшается с ростом числа точек.
  const gap =
    dates.length > 40 ? 0 : dates.length > 20 ? 1 : dates.length > 10 ? 2 : 3;

  return (
    <div className={styles.root} style={{ height, gap }}>
      <div className={styles.sumOverlay}>
        <div
          className={styles.sumTotal}
          style={{ color: getSummaryColor(total) }}
        >
          {fmt(total)}
        </div>
        {nonEmpty.map((d) => (
          <div key={d.name} className={styles.sumLine}>
            <span
              className={styles.sumName}
              style={{ color: getSummaryColor(d.summary) }}
            >
              {d.name}
            </span>
            <span
              className={styles.sumValue}
              style={{ color: getSummaryColor(d.summary) }}
            >
              {fmt(d.summary)}
            </span>
          </div>
        ))}
      </div>
      {hasNeg && (
        <div className={styles.zeroLine} style={{ bottom: `${zeroBottom}%` }} />
      )}
      {dates.map((date) => {
        const posTotal = posExt(date);
        const negTotal = negExt(date);
        // Суммы логов отдельных сегментов даты (в отличие от лога суммы) — чтобы
        // суммарная высота сегментов ровно заполняла отведённую зону без выхода
        // за пределы строки.
        const posLog =
          nonEmpty.reduce((sum, d) => {
            const n = Number(d.data[date]) || 0;
            return n > 0 ? sum + logVal(n) : sum;
          }, 0) || 1;
        const negLog =
          nonEmpty.reduce((sum, d) => {
            const n = Number(d.data[date]) || 0;
            return n < 0 ? sum + logVal(-n) : sum;
          }, 0) || 1;
        // Доля положительной/отрицательной зоны, заполненная стеком этой даты.
        const stackPosH = posTotal > 0 ? zonePos * (logVal(posTotal) / logPos) : 0;
        const stackNegH = negTotal < 0 ? zoneNeg * (logVal(-negTotal) / logNeg) : 0;
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
                const h = stackPosH * (logVal(num) / posLog);
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
              const h = stackNegH * (logVal(-num) / negLog);
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
  );
});

export default StackedBarChart;
