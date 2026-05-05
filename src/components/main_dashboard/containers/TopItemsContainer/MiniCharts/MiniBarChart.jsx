import { useRef, useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import styles from './MiniBarChart.module.css';

const lerp = (a, b, t) => a + (b - a) * t;

const BAR_DIM   = 'rgba(127, 119, 221, 0.28)';  // дефолтный цвет
const BAR_COLOR = '#7F77DD';                       // активный при ховере
const BAR_HOVER = '#534AB7';                       // ховер (тёмнее)

const fmtVal = (v) =>
  Math.round(v).toLocaleString('ru-RU');

const MiniBarChart = ({ values = [], dates = [], label = '' }) => {
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(null); // { index, x, y }
  const barsRef = useRef([]);
  const alphasRef = useRef([]);
  const hovIdxRef = useRef(null);
  const animRef = useRef(null);

  const n = values.length;
  const total = values.reduce((s, v) => s + v, 0);

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

    const PAD = 2;
    const chartW = W - PAD * 2;
    const chartH = H - PAD * 2;
    const maxV = Math.max(...values, 1);
    const gap = Math.max(1, Math.floor(chartW * 0.06 / n));
    const barW = Math.max(2, (chartW - gap * (n - 1)) / n);
    const alphas = alphasRef.current;
    const hi = hovIdxRef.current;

    barsRef.current = [];

    for (let i = 0; i < n; i++) {
      const bH = (values[i] / maxV) * chartH;
      const x = PAD + i * (barW + gap);
      const y = PAD + chartH - bH;
      const alpha = alphas[i] ?? 1;

      ctx.globalAlpha = alpha;
      const r = Math.max(0, Math.min(2, barW / 2, bH / 2));
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.arcTo(x + barW, y, x + barW, y + r, r);
      ctx.lineTo(x + barW, y + bH);
      ctx.lineTo(x, y + bH);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
      // По умолчанию — dim, при ховере — полный цвет
      ctx.fillStyle = hi === null ? BAR_DIM : hi === i ? BAR_COLOR : BAR_DIM;
      ctx.fill();

      if (hi === i) {
        ctx.globalAlpha = Math.min(1, alpha + 0.2);
        ctx.fillStyle = BAR_HOVER;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      barsRef.current.push({ x, y, w: barW, h: bH });
    }
  }, [values, n]);

  useEffect(() => { drawFrame(); }, [drawFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => drawFrame());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [drawFrame]);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  const startAnimation = useCallback(() => {
    if (animRef.current) return;
    const tick = () => {
      const alphas = alphasRef.current;
      const hi = hovIdxRef.current;
      let dirty = false;
      alphas.forEach((a, i) => {
        const target = hi === null ? 1 : hi === i ? 1 : 0.3;
        const next = lerp(a, target, 0.2);
        if (Math.abs(next - a) > 0.003) { alphas[i] = next; dirty = true; }
        else alphas[i] = target;
      });
      drawFrame();
      animRef.current = dirty ? requestAnimationFrame(tick) : null;
    };
    animRef.current = requestAnimationFrame(tick);
  }, [drawFrame]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = barsRef.current.findIndex(
      ({ x, y, w, h }) => mx >= x && mx <= x + w && my >= y - 4 && my <= y + h + 4
    );
    const newIdx = hit === -1 ? null : hit;
    if (newIdx !== hovIdxRef.current) {
      hovIdxRef.current = newIdx;
      setHovered(newIdx === null ? null : {
        index: newIdx,
        x: barsRef.current[newIdx].x + barsRef.current[newIdx].w / 2,
        y: barsRef.current[newIdx].y,
      });
      if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
      startAnimation();
    }
  };

  const handleMouseLeave = () => {
    hovIdxRef.current = null;
    setHovered(null);
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    startAnimation();
  };

  return (
    <div className={styles.wrap}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {/* Суммарное значение — поверх графика, по центру */}
      <div className={`${styles.overlay} ${hovered ? styles.hidden : ''}`}>
        {fmtVal(total)}
      </div>
      {/* Тултип при наведении */}
      {hovered && dates[hovered.index] && (
        <div
          className={styles.tooltip}
          style={{ left: hovered.x, top: hovered.y }}
        >
          <span className={styles.ttDate}>{format(dates[hovered.index], 'dd.MM')}</span>
          <span className={styles.ttVal}>{fmtVal(values[hovered.index])}</span>
        </div>
      )}
    </div>
  );
};

export default MiniBarChart;
