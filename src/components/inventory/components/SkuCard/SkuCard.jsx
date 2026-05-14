import React, { useRef, useEffect, useLayoutEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import { sliceTimeSeriesForRange } from '../../utils/inventoryHelpers';
import styles from './SkuCard.module.css';

// Chart canvas size — will match metric grid width
const CHART_H = 62;

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const Tooltip = ({ tooltip }) => {
  if (!tooltip) return null;
  return (
    <div style={{
      position: 'fixed', zIndex: 9999, pointerEvents: 'none',
      left: tooltip.x, top: tooltip.y,
      transform: 'translate(-50%, calc(-100% - 8px))',
      background: 'rgba(17,24,39,0.9)',
      color: '#fff', borderRadius: 6, padding: '5px 8px',
      textAlign: 'center', minWidth: 80,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {tooltip.lines.map((line, i) => (
        <div key={i} style={{
          fontSize: i === 0 ? 10 : 11,
          fontWeight: i === 0 ? 400 : 600,
          color: i === 0 ? 'rgba(255,255,255,0.5)' : '#fff',
          lineHeight: 1.4,
        }}>{line}</div>
      ))}
    </div>
  );
};

// ─── Bar+Line chart ───────────────────────────────────────────────────────────
const MiniBarLineChart = ({ orders, prices, startDate, endDate, width }) => {
  const canvasRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const hoverRef = useRef(-1);
  const snapRef = useRef({ orderData: [], priceData: [], labels: [] });
  const W = width || 130;

  const redraw = useCallback((hIdx = -1) => {
    const { orderData, priceData } = snapRef.current;
    if (!orderData.length || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, W, CHART_H);
    const n = orderData.length;
    const maxO = Math.max(...orderData, 1);
    const maxP = Math.max(...priceData, 1);
    const minP = Math.min(...priceData, 0);
    const slotW = W / n;
    const barW = Math.max(1, slotW - 1.5);

    orderData.forEach((v, i) => {
      const bh = Math.max(1, (v / maxO) * (CHART_H * 0.68));
      ctx.fillStyle = i === hIdx ? 'rgba(108,99,255,0.65)' : 'rgba(108,99,255,0.22)';
      ctx.fillRect(i * slotW, CHART_H - bh, barW, bh);
    });

    if (priceData.length > 1) {
      const rng = maxP - minP || 1;
      ctx.beginPath();
      ctx.strokeStyle = '#F87171';
      ctx.lineWidth = 1.5;
      priceData.forEach((v, i) => {
        const x = i * slotW + barW / 2;
        const y = CHART_H - ((v - minP) / rng) * (CHART_H * 0.52) - 5;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }, [W]);

  // useLayoutEffect fires synchronously after DOM mutations — canvas is ready
  useLayoutEffect(() => {
    if (!startDate || !endDate) return;
    const orderData = sliceTimeSeriesForRange(orders ?? [], startDate, endDate);
    const priceData = sliceTimeSeriesForRange(prices ?? [], startDate, endDate);
    // Build labels from actual startDate: index 0 = startDate, index n-1 = endDate
    const labels = orderData.map((_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}`;
    });
    snapRef.current = { orderData, priceData, labels };
    redraw(-1);
  }, [orders, prices, startDate, endDate, redraw]);

  const { orderData, priceData, labels } = snapRef.current;
  const noData = !orderData.length || orderData.every(v => v === 0);

  return (
    <div className={styles.chartBox} style={{ width: W, height: CHART_H }}>
      {noData
        ? <div className={styles.noDataBox} style={{ width: W, height: CHART_H }}>нет данных</div>
        : <>
            <canvas
              ref={canvasRef} width={W} height={CHART_H}
              style={{ display: 'block', width: W, height: CHART_H }}
              onMouseMove={e => {
                const r = canvasRef.current?.getBoundingClientRect();
                if (!r || !orderData.length) return;
                const i = Math.min(Math.floor(((e.clientX - r.left) / r.width) * orderData.length), orderData.length - 1);
                if (i !== hoverRef.current) { hoverRef.current = i; redraw(i); }
                setTooltip({ x: e.clientX, y: e.clientY, lines: [labels[i], `${orderData[i]} шт.`, `${(priceData[i]||0).toLocaleString()} ₽`] });
              }}
              onMouseLeave={() => { hoverRef.current = -1; redraw(-1); setTooltip(null); }}
            />
            <Tooltip tooltip={tooltip} />
          </>
      }
    </div>
  );
};

// ─── CPO Line chart ───────────────────────────────────────────────────────────
const MiniLineChart = ({ data, startDate, endDate, width }) => {
  const canvasRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const snapRef = useRef({ d: [], labels: [] });
  const W = width || 130;

  useLayoutEffect(() => {
    if (!startDate || !endDate) return;
    const d = sliceTimeSeriesForRange(data ?? [], startDate, endDate);
    // Build labels from actual startDate
    const labels = d.map((_, i) => {
      const dt = new Date(startDate);
      dt.setDate(dt.getDate() + i);
      return `${String(dt.getDate()).padStart(2,'0')}.${String(dt.getMonth()+1).padStart(2,'0')}`;
    });
    snapRef.current = { d, labels };

    const c = canvasRef.current;
    if (!c || !d.length || d.every(v => v === 0)) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, W, CHART_H);
    const n = d.length;
    if (n < 2) return;
    const max = Math.max(...d, 1);
    const min = Math.min(...d, 0);
    const rng = max - min || 1;
    const px = i => (i / (n - 1)) * W;
    const py = v => CHART_H - ((v - min) / rng) * (CHART_H * 0.8) - 4;

    ctx.beginPath();
    d.forEach((v, i) => i === 0 ? ctx.moveTo(px(i), py(v)) : ctx.lineTo(px(i), py(v)));
    ctx.lineTo(W, CHART_H); ctx.lineTo(0, CHART_H); ctx.closePath();
    ctx.fillStyle = 'rgba(108,99,255,0.08)';
    ctx.fill();

    ctx.beginPath();
    d.forEach((v, i) => i === 0 ? ctx.moveTo(px(i), py(v)) : ctx.lineTo(px(i), py(v)));
    ctx.strokeStyle = '#6C63FF'; ctx.lineWidth = 1.5; ctx.stroke();
  }, [data, startDate, endDate, W]);

  const { d, labels } = snapRef.current;
  const noData = !d.length || d.every(v => v === 0);

  return (
    <div className={styles.chartBox} style={{ width: W, height: CHART_H }}>
      {noData
        ? <div className={styles.noDataBox} style={{ width: W, height: CHART_H }}>нет данных</div>
        : <>
            <canvas
              ref={canvasRef} width={W} height={CHART_H}
              style={{ display: 'block', width: W, height: CHART_H }}
              onMouseMove={e => {
                const r = canvasRef.current?.getBoundingClientRect();
                if (!r || !d.length) return;
                const i = Math.min(Math.floor(((e.clientX - r.left) / r.width) * d.length), d.length - 1);
                setTooltip({ x: e.clientX, y: e.clientY, lines: [labels[i], `${d[i].toLocaleString()} ₽`] });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
            <Tooltip tooltip={tooltip} />
          </>
      }
    </div>
  );
};

// ─── Date mask ────────────────────────────────────────────────────────────────
const DateMaskInput = ({ defaultValue, onValidDate, className }) => {
  const inputRef = React.useRef(null);

  // Sync DOM value directly when prop changes (covers F5 rehydration and "Apply to all")
  React.useLayoutEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = defaultValue || '';
    }
  }, [defaultValue]);

  const handleKeyDown = (e) => {
    const ctrl = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
    if (ctrl.includes(e.key)) return;
    if (!/^\d$/.test(e.key)) { e.preventDefault(); return; }
    const raw = e.currentTarget.value.replace(/\D/g, '');
    if (raw.length === 4 && Number(e.key) > 1) { e.preventDefault(); return; }
    if (raw.length === 5) {
      if (raw[4] === '1' && Number(e.key) > 2) { e.preventDefault(); return; }
      if (raw[4] === '0' && e.key === '0') { e.preventDefault(); return; }
    }
    if (raw.length === 6 && Number(e.key) > 3) { e.preventDefault(); return; }
    if (raw.length === 7) {
      if (raw[6] === '3' && Number(e.key) > 1) { e.preventDefault(); return; }
      if (raw[6] === '0' && e.key === '0') { e.preventDefault(); return; }
    }
    if (raw.length >= 8) { e.preventDefault(); return; }
  };

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    let fmt = digits.slice(0,4);
    if (digits.length > 4) fmt += '-' + digits.slice(4,6);
    if (digits.length > 6) fmt += '-' + digits.slice(6,8);
    e.target.value = fmt;
    if (/^\d{4}-\d{2}-\d{2}$/.test(fmt)) onValidDate(fmt);
  };

  return (
    <input
      ref={inputRef}
      type="text" maxLength={10} placeholder="ГГГГ-ММ-ДД"
      defaultValue={defaultValue || ''}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      className={className}
    />
  );
};

// ─── SkuCard ──────────────────────────────────────────────────────────────────
const SkuCard = ({ sku, dateRange, startCalcDate, fullSkuList, onStartCalcDateChange, onApplyStartCalcDateToAll, onDeleteSingleOrder }) => {
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);

  const [copied, setCopied] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const copyTimers = useRef([]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(sku.vcName).then(() => {
      // Clear any pending timers
      copyTimers.current.forEach(t => clearTimeout(t));
      setFadeOut(false);
      setCopied(true);
      // Start fade-out after 600ms
      copyTimers.current[0] = setTimeout(() => setFadeOut(true), 600);
      // Hide completely after fade-out (600 + 800ms transition)
      copyTimers.current[1] = setTimeout(() => { setCopied(false); setFadeOut(false); }, 1400);
    });
  }, [sku.vcName]);

  const roi = sku.selfPrice > 0 ? ((sku.ebitdaAvg / sku.selfPrice) * 100).toFixed(0) : 0;

  // Measure metric grid width to match chart width
  const metricsRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(130);
  useLayoutEffect(() => {
    if (metricsRef.current) {
      // Each metric box is ~half the grid minus gap
      // Grid width = infoCol width - padding
      const w = Math.floor((metricsRef.current.offsetWidth - 7) / 2);
      if (w > 80) setChartWidth(w);
    }
  }, []);

  return (
    <div className={styles.skuCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <button className={styles.vcNameBtn} onClick={handleCopy} title="Нажмите чтобы скопировать">
          <span className={styles.vcName}>{sku.vcName}</span>
          {copied && (
            <span className={`${styles.copyHint} ${fadeOut ? styles.copyHintFadeOut : styles.copyHintFadeIn}`}>
              Скопировано
            </span>
          )}
        </button>
        <div className={styles.headerActions}>
          <Link to={`/vendorcodes/${sku.id}`} target="_blank" className={styles.iconBtn}><FaExternalLinkAlt /></Link>
          <button className={`${styles.iconBtn} ${styles.iconBtnDelete}`} onClick={onDeleteSingleOrder}><MdDeleteForever /></button>
        </div>
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        <div className={styles.infoCol}>
          {/* Date */}
          <div className={styles.dateRow}>
            <span className={styles.dateLabel}>Дата расчёта</span>
            <DateMaskInput defaultValue={startCalcDate} onValidDate={v => onStartCalcDateChange(sku.vcName, v)} className={styles.dateInput} />
            <button className={styles.applyAllBtn} onClick={() => onApplyStartCalcDateToAll(sku.vcName, fullSkuList)} disabled={!startCalcDate}>Все</button>
          </div>

          {/* Metrics */}
          <div className={styles.metricsGrid} ref={metricsRef}>
            <Metric label="EBITDA/день" value={`${(sku.ebitdaDailyAvg||0).toLocaleString()} ₽`} />
            <Metric label="EBITDA" value={`${(sku.ebitdaAvg||0).toLocaleString()} ₽`} />
            <Metric label="Себестоимость" value={`${(sku.selfPrice||0).toLocaleString()} ₽`} />
            <Metric label="ROI" value={`${roi}%`} />
          </div>

          {/* Charts — same width as metric boxes */}
          <div className={styles.chartsRow}>
            <div className={styles.chartWrap}>
              <span className={styles.chartTitle}>Заказы & Цены</span>
              <MiniBarLineChart
                orders={sku.ordersTimeSeries}
                prices={sku.pricesTimeSeries}
                startDate={startDate}
                endDate={endDate}
                width={chartWidth}
              />
              {sku.ordersSum > 0 && <span className={styles.ordersCount}>{sku.ordersSum.toLocaleString()} шт.</span>}
            </div>
            <div className={styles.chartWrap}>
              <span className={styles.chartTitle}>СРО</span>
              <MiniLineChart data={sku.cpoTimeSeries} startDate={startDate} endDate={endDate} width={chartWidth} />
            </div>
          </div>
        </div>

        {/* Image */}
        <div className={styles.imageCol}>
          <div className={styles.imageWrap}>
            <img src={sku.image} alt={sku.vcName} className={styles.productImage} />
            <div className={styles.badgesOverlay}>
              <div className={styles.abcBadge}><span className={styles.badgeLabel}>Товар</span><span className={styles.badgeValue}>{sku.abc}</span></div>
              <div className={styles.abcBadge}><span className={styles.badgeLabel}>Кат.</span><span className={styles.badgeValue}>{sku.abcCategory}</span></div>
            </div>
            {sku.buyout != null && (
              <div className={styles.buyoutBadge}>
                <span className={styles.badgeLabel}>% выкупа</span>
                <span className={styles.badgeValue}>{sku.buyout}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Metric = ({ label, value }) => (
  <div className={styles.metricBox}>
    <div className={styles.metricLabel}>{label}</div>
    <div className={styles.metricValue}>{value}</div>
  </div>
);

export default SkuCard;
