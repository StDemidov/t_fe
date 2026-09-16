import { memo } from 'react';
import styles from './BarChart.module.css';

const hexToRgba = (hex, alpha) => {
  let h = hex.replace('#', '');
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Универсальная столбчатая диаграмма.
 *
 * Отрисовывается чистым CSS (без canvas) — лёгкая даже при сотнях экземпляров.
 * Поверх графика по умолчанию показывается сводка (summary); при наведении
 * она скрывается и столбцы выделяются (затемняется столбец под курсором).
 * Подпись к каждому столбцу — в нативном тултипе (label: значение).
 *
 * @param {object} props
 * @param {Record<string, number>} props.data — объект { дата: значение, … }
 * @param {string|number} [props.summary] — значение для вывода поверх графика
 * @param {string} [props.color='#8254ff'] — цвет положительных столбцов
 * @param {string} [props.negativeColor='#ff5454'] — цвет отрицательных столбцов
 * @param {string} [props.zeroColor='#a0a0a0'] — цвет нулевых столбцов
 * @param {number} [props.height=48] — высота графика в пикселях
 */
const BarChart = memo(function BarChart({
  data = {},
  summary,
  color = '#8254ff',
  negativeColor = '#ff5454',
  zeroColor = '#a0a0a0',
  summaryColor,
  height = 48,
}) {
  const entries = Object.entries(data);

  if (entries.length === 0) {
    return <div className={styles.noData}>Нет данных</div>;
  }

  const total = entries.reduce(
    (sum, [, value]) => sum + (Number(value) || 0),
    0
  );

  if (total === 0) {
    return <div className={styles.noData}>Нет данных</div>;
  }

  // Логарифмическое масштабирование: log10(1 + |x|) сжимает крупные значения,
  // чтобы они не выходили за пределы графика. log10(1+x) корректна и для 0.
  const logVal = (x) => Math.log10(1 + x);

  let maxPos = 0;
  let maxNeg = 0;
  entries.forEach(([, value]) => {
    const n = Number(value) || 0;
    if (n > 0) maxPos = Math.max(maxPos, n);
    else if (n < 0) maxNeg = Math.max(maxNeg, -n);
  });
  const hasNeg = maxNeg > 0;
  // Размеры положительной и отрицательной зон пропорциональны логарифмам
  // максимальных величин — всё гарантированно помещается внутри графика.
  const logPos = logVal(Math.max(1, maxPos));
  const logNeg = logVal(Math.max(1, maxNeg));
  const denom = logPos + logNeg;
  const zonePos = (logPos / denom) * 100;
  const zoneNeg = (logNeg / denom) * 100;
  const zeroBottom = hasNeg ? zoneNeg : 0;

  // Отступ между столбцами уменьшается с ростом числа точек, чтобы столбцы не
  // выдавливались за пределы ячейки при большом диапазоне дат.
  const gap =
    entries.length > 40
      ? 0
      : entries.length > 20
      ? 1
      : entries.length > 10
      ? 2
      : 3;

  return (
    <div className={styles.root} style={{ height, gap }}>
      {summary !== undefined && (
        <div
          className={styles.sumOverlay}
          style={summaryColor ? { color: summaryColor } : undefined}
        >
          {summary}
        </div>
      )}
      {hasNeg && (
        <div className={styles.zeroLine} style={{ bottom: `${zeroBottom}%` }} />
      )}
      {entries.map(([label, value]) => {
        const num = Number(value) || 0;
        const barColor = num > 0 ? color : num < 0 ? negativeColor : zeroColor;
        // Положительные растут вверх от нулевой оси, отрицательные — вниз.
        // Высоты берутся в логарифмическом масштабе.
        const pct =
          num > 0
            ? zonePos * (logVal(num) / logPos)
            : zoneNeg * (logVal(-num) / logNeg);
        return (
          <div key={label} className={styles.barCell}>
            <span className={styles.tooltip}>
              <span className={styles.tooltipTitle}>{label}</span>
              <span className={styles.tooltipBody}>
                {num.toLocaleString('ru-RU')}
              </span>
            </span>
            <div
              className={styles.bar}
              style={{
                height: `${pct}%`,
                bottom:
                  num >= 0 ? `${zeroBottom}%` : `${zeroBottom - pct}%`,
                background: hexToRgba(barColor, 0.85),
              }}
            />
          </div>
        );
      })}
    </div>
  );
});

export default BarChart;
