import { useState, useRef } from 'react';
import { subDays } from 'date-fns';
import MiniBarChart from '../MiniCharts/MiniBarChart';
import MiniLineChart from '../MiniCharts/MiniLineChart';
import PercentBadge from '../MiniCharts/PercentBadge';
import styles from './TopItemsTable.module.css';

const TOP_OPTIONS = [
  { value: 'top_10_by_ebitda', label: 'Топ по EBITDA' },
  { value: 'top_10_by_sales',  label: 'Топ по продажам' },
  { value: 'top_10_by_roi',    label: 'Топ по ROI' },
];
/* Вычисляем transform-origin в зависимости от позиции строки в списке */
const getPhotoOrigin = (idx, total) => {
  if (idx === 0) return 'top center';
  if (idx >= total - 2) return 'bottom center';
  return 'center center';
};



const fmtRoi = (v) => {
  if (v == null) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
};

const buildDates = (endDate, len) => {
  if (!endDate || !len) return [];
  return Array.from({ length: len }, (_, i) => subDays(endDate, len - 1 - i));
};

/* Компонент артикула с бегущей строкой */
const SkuCell = ({ sku }) => {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  const handleMouseEnter = () => {
    if (!outerRef.current || !innerRef.current) return;
    const outerW = outerRef.current.offsetWidth;
    const innerW = innerRef.current.scrollWidth;
    if (innerW <= outerW) return; // текст влезает — анимация не нужна
    const overflow = innerW - outerW;
    const dur = Math.max(2.5, overflow / 30); // скорость ~30px/с
    innerRef.current.style.setProperty('--marquee-offset', `-${overflow}px`);
    innerRef.current.style.setProperty('--marquee-dur', `${dur}s`);
    innerRef.current.classList.add(styles.marqueeActive);
  };

  const handleMouseLeave = () => {
    if (!innerRef.current) return;
    innerRef.current.classList.remove(styles.marqueeActive);
    innerRef.current.style.transform = 'translateX(0)';
  };

  return (
    <div
      className={styles.skuCell}
      ref={outerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className={styles.skuText} ref={innerRef}>{sku}</span>
    </div>
  );
};

const TopItemsTable = ({ data = {}, endDate = null, isLoading = false }) => {
  const [topKey, setTopKey] = useState('top_10_by_ebitda');

  const rows = Object.entries(data[topKey] ?? {}).map(([sku, item]) => ({
    sku,
    ...item,
  }));

  const sampleLen = rows[0]?.sales?.length ?? 0;
  const dates = buildDates(endDate, sampleLen);

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Топ артикулов</span>
        </div>
        <div className={styles.skeleton}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skRow} style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) return null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>Топ артикулов</span>
        <select
          className={styles.select}
          value={topKey}
          onChange={(e) => setTopKey(e.target.value)}
        >
          {TOP_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.thead}>
              <th className={`${styles.th} ${styles.colPhoto}`}>Фото</th>
              <th className={`${styles.th} ${styles.colSku}`} style={{ textAlign: 'left' }}>Артикул</th>
              <th className={`${styles.th} ${styles.colChart}`}>Объём продаж</th>
              <th className={`${styles.th} ${styles.colBadge}`}>Доля продаж</th>
              <th className={`${styles.th} ${styles.colChart}`}>EBITDA</th>
              <th className={`${styles.th} ${styles.colBadge}`}>Доля EBITDA</th>
              <th className={`${styles.th} ${styles.colChart}`}>Цена</th>
              <th className={`${styles.th} ${styles.colRoi}`}>ROI</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.sku}
                className={`${styles.tr} ${idx % 2 === 0 ? styles.trEven : ''}`}
              >
                {/* Фото */}
                <td className={`${styles.td} ${styles.colPhoto}`}>
                  <div className={styles.photoWrap}>
                    {row.image ? (
                      <img
                        src={row.image}
                        alt={row.sku}
                        className={styles.photo}
                        loading="lazy"
                        style={{ transformOrigin: getPhotoOrigin(idx, rows.length) }}
                      />
                    ) : (
                      <div className={styles.photoPlaceholder} />
                    )}
                  </div>
                </td>

                {/* Артикул */}
                <td className={`${styles.td} ${styles.colSku}`} style={{ textAlign: 'left' }}>
                  <SkuCell sku={row.sku} />
                </td>

                {/* Объём продаж */}
                <td className={`${styles.td} ${styles.colChart}`}>
                  <div className={styles.chartCell}>
                    <MiniBarChart values={row.sales ?? []} dates={dates} />
                  </div>
                </td>

                {/* Доля продаж */}
                <td className={`${styles.td} ${styles.colBadge}`}>
                  <PercentBadge value={row.sales_percent ?? 0} decimals={2} />
                </td>

                {/* EBITDA */}
                <td className={`${styles.td} ${styles.colChart}`}>
                  <div className={styles.chartCell}>
                    <MiniBarChart values={row.ebitda ?? []} dates={dates} />
                  </div>
                </td>

                {/* Доля EBITDA */}
                <td className={`${styles.td} ${styles.colBadge}`}>
                  <PercentBadge value={row.ebitda_percent ?? 0} decimals={2} />
                </td>

                {/* Цена */}
                <td className={`${styles.td} ${styles.colChart}`}>
                  <div className={styles.chartCell}>
                    <MiniLineChart values={row.prices ?? []} dates={dates} />
                  </div>
                </td>

                {/* ROI */}
                <td className={`${styles.td} ${styles.colRoi}`}>
                  <span
                    className={`${styles.roiBadge} ${
                      (row.roi ?? 0) >= 0 ? styles.roiPos : styles.roiNeg
                    }`}
                  >
                    {fmtRoi(row.roi)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopItemsTable;
