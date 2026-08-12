import { memo } from 'react';
import styles from './BarChart.module.css';

const hexToRgba = (hex, alpha) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
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
 * она скрывается и столбцы становятся ярче. Подпись к каждому столбцу —
 * в нативном тултипе (label: значение).
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

  const maxAbs = Math.max(
    1,
    ...entries.map(([, value]) => Math.abs(Number(value) || 0))
  );

  return (
    <div className={styles.root} style={{ height }}>
      {summary !== undefined && (
        <div className={styles.sumOverlay}>{summary}</div>
      )}
      {entries.map(([label, value]) => {
        const num = Number(value) || 0;
        const barColor =
          num > 0 ? color : num < 0 ? negativeColor : zeroColor;
        const pct = (Math.abs(num) / maxAbs) * 100;
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
                background: hexToRgba(barColor, 0.3),
              }}
            />
          </div>
        );
      })}
    </div>
  );
});

export default BarChart;
