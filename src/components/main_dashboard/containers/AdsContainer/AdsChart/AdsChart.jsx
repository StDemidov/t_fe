import { useRef, useEffect, useState, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import styles from './AdsChart.module.css';

/* ── Цвета ── */
const BAR_COLOR = '#7F77DD';
const BAR_HOVER = '#534AB7';
const BAR_DIM = 'rgba(127, 119, 221, 0.28)';
const LINE_CPO = '#D4537E';
const LINE_CPS = '#EF9F27';
const AXIS_COLOR = 'rgba(83, 74, 183, 0.13)';
const LABEL_COLOR = '#aaa';
const LABEL_HOVER = '#534AB7';

const lerp = (a, b, t) => a + (b - a) * t;

const SK_HEIGHTS = [65, 80, 55, 90, 70, 60, 85, 50, 75, 68, 72];

const fmtRub = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} млн ₽`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} тыс ₽`;
  return `${Math.round(n)} ₽`;
};

const fmtDate = (d) => format(d, 'dd.MM');

export const AdsSkeleton = () => (
  <div className={styles.skeleton}>
    {SK_HEIGHTS.map((h, i) => (
      <div
        key={i}
        className={styles.skBar}
        style={{ height: `${h}%`, animationDelay: `${i * 0.06}s` }}
      />
    ))}
  </div>
);

const AdsChart = ({
  data = {},
  isLoading = false,
  title = 'Рек. расходы, CPO и CPS',
  startDate = null,
  endDate = null,
  filterSlot = null, // ReactNode — слот для фильтра в шапке
}) => {
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const barsRef = useRef([]);
  const alphasRef = useRef([]);
  const hoveredIndexRef = useRef(null);
  const animateRef = useRef(null);

  const adsCosts = data.ads_costs ?? [];
  const cpo = data.cpo ?? [];
  const cps = data.cps ?? [];
  const n = adsCosts.length;

  // Генерируем даты: startDate + i дней
  const dates = [];
  if (startDate && n > 0) {
    for (let i = 0; i < n; i++) {
      dates.push(subDays(endDate, n - 1 - i));
    }
  }

  useEffect(() => {
    alphasRef.current = Array(n).fill(1);
  }, [n]);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || n === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    if (!W || !H) return;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const PAD_LEFT = 60;   // левая ось (рублей)
    const PAD_RIGHT = 48;  // правая ось (CPO/CPS)
    const PAD_TOP = 12;

    // Предварительно оцениваем ширину слота, чтобы выбрать режим подписей OX
    const estChartW = W - PAD_LEFT - PAD_RIGHT;
    const estGap = 6;
    const estBarW = Math.max(4, (estChartW - estGap * (n + 1)) / n);
    const slotW = estBarW + estGap;

    // slotW >= 32 → горизонтальные подписи (PAD_BOTTOM = 28)
    // slotW >= 14 → вертикальные подписи  (PAD_BOTTOM = 52)
    // slotW <  14 → подписи скрыты        (PAD_BOTTOM = 16)
    const labelMode = slotW >= 32 ? 'horizontal' : slotW >= 14 ? 'vertical' : 'none';
    const PAD_BOTTOM = labelMode === 'horizontal' ? 28 : labelMode === 'vertical' ? 52 : 16;

    const chartW = W - PAD_LEFT - PAD_RIGHT;
    const chartH = H - PAD_TOP - PAD_BOTTOM;

    /* ── Шкала левой оси (ads_costs) ── */
    const maxCost = Math.max(...adsCosts, 1);
    const costScale = (v) => PAD_TOP + chartH * (1 - v / maxCost);

    /* ── Шкала правой оси (cpo + cps вместе) ── */
    const lineVals = [...cpo, ...cps];
    const maxLine = Math.max(...lineVals, 1);
    const lineScale = (v) => PAD_TOP + chartH * (1 - v / maxLine);

    /* ── Сетка + левые метки ── */
    const gridCount = 5;
    ctx.font = `10px system-ui, sans-serif`;
    for (let i = 0; i <= gridCount; i++) {
      const y = PAD_TOP + (chartH / gridCount) * i;
      ctx.strokeStyle = AXIS_COLOR;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD_LEFT, y);
      ctx.lineTo(W - PAD_RIGHT, y);
      ctx.stroke();

      // Левая ось
      const lv = maxCost * (1 - i / gridCount);
      ctx.fillStyle = LABEL_COLOR;
      ctx.textAlign = 'right';
      ctx.fillText(fmtRub(lv), PAD_LEFT - 4, y + 3.5);

      // Правая ось
      const rv = maxLine * (1 - i / gridCount);
      ctx.textAlign = 'left';
      ctx.fillText(`${Math.round(rv)} ₽`, W - PAD_RIGHT + 4, y + 3.5);
    }

    /* ── Столбики ads_costs ── */
    const gap = 6;
    const barW = Math.max(4, (chartW - gap * (n + 1)) / n);
    barsRef.current = [];
    const alphas = alphasRef.current;
    const hi = hoveredIndexRef.current;

    for (let i = 0; i < n; i++) {
      const x = PAD_LEFT + gap + i * (barW + gap);
      const bTop = costScale(adsCosts[i]);
      const bH = PAD_TOP + chartH - bTop;
      const alpha = alphas[i] ?? 1;

      ctx.globalAlpha = alpha;
      const r = Math.min(4, barW / 2, bH / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, bTop);
      ctx.lineTo(x + barW - r, bTop);
      ctx.arcTo(x + barW, bTop, x + barW, bTop + r, r);
      ctx.lineTo(x + barW, bTop + bH);
      ctx.lineTo(x, bTop + bH);
      ctx.lineTo(x, bTop + r);
      ctx.arcTo(x, bTop, x + r, bTop, r);
      ctx.closePath();
      ctx.fillStyle = BAR_COLOR;
      ctx.fill();

      if (hi === i) {
        ctx.globalAlpha = (1 - alpha) * 0.55 + 0.45;
        ctx.fillStyle = BAR_HOVER;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // X-метки (дата) — режим зависит от ширины слота
      if (dates[i] && labelMode !== 'none') {
        ctx.font = `9.5px system-ui, sans-serif`;
        ctx.fillStyle = hi === i ? LABEL_HOVER : LABEL_COLOR;
        const labelX = x + barW / 2;

        if (labelMode === 'horizontal') {
          ctx.textAlign = 'center';
          ctx.fillText(fmtDate(dates[i]), labelX, H - PAD_BOTTOM + 13);
        } else {
          // vertical
          ctx.save();
          ctx.translate(labelX, H - PAD_BOTTOM + 6);
          ctx.rotate(-Math.PI / 2);
          ctx.textAlign = 'right';
          ctx.fillText(fmtDate(dates[i]), 0, 3);
          ctx.restore();
        }
      }

      barsRef.current.push({ x, y: bTop, w: barW, h: bH, index: i });
    }

    /* ── Центры столбиков для точек линий ── */
    const cx = (i) => PAD_LEFT + gap + i * (barW + gap) + barW / 2;

    /* ── Линия CPO ── */
    const drawLine = (vals, color, scaleY) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      vals.forEach((v, i) => {
        const x = cx(i);
        const y = scaleY(v);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Точки
      vals.forEach((v, i) => {
        const isHov = hi === i;
        ctx.beginPath();
        ctx.arc(cx(i), scaleY(v), isHov ? 4.5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = isHov ? 2.5 : 1.8;
        ctx.stroke();
      });
    };

    drawLine(cpo, LINE_CPO, lineScale);
    drawLine(cps, LINE_CPS, lineScale);
  }, [adsCosts, cpo, cps, dates, n]);

  useEffect(() => { drawFrame(); }, [drawFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => drawFrame());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [drawFrame]);

  useEffect(() => () => { if (animateRef.current) cancelAnimationFrame(animateRef.current); }, []);

  const startAnimation = useCallback(() => {
    if (animateRef.current) return;
    const tick = () => {
      const alphas = alphasRef.current;
      const hi = hoveredIndexRef.current;
      const SPEED = 0.18;
      let dirty = false;
      alphas.forEach((a, i) => {
        const target = hi === null ? 1 : hi === i ? 1 : 0.28;
        const next = lerp(a, target, SPEED);
        if (Math.abs(next - a) > 0.003) { alphas[i] = next; dirty = true; }
        else alphas[i] = target;
      });
      drawFrame();
      animateRef.current = dirty ? requestAnimationFrame(tick) : null;
    };
    animateRef.current = requestAnimationFrame(tick);
  }, [drawFrame]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const hit = barsRef.current.findIndex(
      ({ x, y, w, h }) => mx >= x && mx <= x + w && my >= y - 12 && my <= y + h + 12
    );
    const newIdx = hit === -1 ? null : hit;

    if (newIdx !== hoveredIndexRef.current) {
      hoveredIndexRef.current = newIdx;
      if (newIdx === null) {
        setHovered(null);
      } else {
        const bar = barsRef.current[newIdx];
        setHovered({
          index: newIdx,
          x: bar.x + bar.w / 2,
          y: bar.y,
          date: dates[newIdx],
          cost: adsCosts[newIdx],
          cpo: cpo[newIdx],
          cps: cps[newIdx],
        });
      }
      if (animateRef.current) { cancelAnimationFrame(animateRef.current); animateRef.current = null; }
      startAnimation();
    }
  };

  const handleMouseLeave = () => {
    hoveredIndexRef.current = null;
    setHovered(null);
    if (animateRef.current) { cancelAnimationFrame(animateRef.current); animateRef.current = null; }
    startAnimation();
  };

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>{title}</span>
          {filterSlot}
        </div>
        <AdsSkeleton />
      </div>
    );
  }

  if (n === 0) return null;

  return (
    <div className={styles.card}>
      {/* ── Шапка: заголовок слева, фильтр справа ── */}
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>{title}</span>
        {filterSlot && <div className={styles.filterWrap}>{filterSlot}</div>}
      </div>

      {/* ── Canvas ── */}
      <div className={styles.chartWrap}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          role="img"
          aria-label={`Комбинированная диаграмма: ${title}`}
        />

        {hovered && (
          <div className={styles.tooltip} style={{ left: hovered.x, top: hovered.y }}>
            {hovered.date && (
              <span className={styles.tooltipDate}>{format(hovered.date, 'dd.MM.yyyy')}</span>
            )}
            <span className={styles.tooltipRow}>
              <span className={styles.tooltipDot} style={{ background: BAR_COLOR }} />
              <span className={styles.tooltipLabel}>Расходы</span>
              <span className={styles.tooltipVal}>{fmtRub(hovered.cost)}</span>
            </span>
            <span className={styles.tooltipRow}>
              <span className={styles.tooltipDot} style={{ background: LINE_CPO }} />
              <span className={styles.tooltipLabel}>CPO</span>
              <span className={styles.tooltipVal}>{fmtRub(hovered.cpo)}</span>
            </span>
            <span className={styles.tooltipRow}>
              <span className={styles.tooltipDot} style={{ background: LINE_CPS }} />
              <span className={styles.tooltipLabel}>CPS</span>
              <span className={styles.tooltipVal}>{fmtRub(hovered.cps)}</span>
            </span>
          </div>
        )}
      </div>

      {/* ── Легенда внизу по центру ── */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendBar} style={{ background: BAR_COLOR }} />
          Рек. расходы
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendLine} style={{ background: LINE_CPO }} />
          CPO
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendLine} style={{ background: LINE_CPS }} />
          CPS
        </span>
      </div>
    </div>
  );
};

export default AdsChart;
