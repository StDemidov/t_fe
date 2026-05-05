import { useRef, useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import styles from './MiniLineChart.module.css';

const LINE_COLOR = '#7F77DD';
const DOT_HOVER_COLOR = '#534AB7';
const FILL_COLOR = 'rgba(127, 119, 221, 0.1)';

const fmtVal = (v) => Math.round(v).toLocaleString('ru-RU') + ' ₽';

const MiniLineChart = ({ values = [], dates = [] }) => {
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const pointsRef = useRef([]); // { x, y, index }
  const hovIdxRef = useRef(null);

  const n = values.length;
  const avg = n > 0 ? values.reduce((s, v) => s + v, 0) / n : 0;

  const drawFrame = useCallback((hoveredIdx = null) => {
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

    const PAD_X = 4;
    const PAD_Y = 4;
    const chartW = W - PAD_X * 2;
    const chartH = H - PAD_Y * 2;
    const maxV = Math.max(...values, 1);
    const minV = Math.min(...values, 0);
    const range = maxV - minV || 1;

    const px = (i) => PAD_X + (i / (n - 1)) * chartW;
    const py = (v) => PAD_Y + chartH * (1 - (v - minV) / range);

    pointsRef.current = values.map((v, i) => ({ x: px(i), y: py(v), index: i }));

    // Заливка под линией
    ctx.beginPath();
    ctx.moveTo(px(0), py(values[0]));
    for (let i = 1; i < n; i++) ctx.lineTo(px(i), py(values[i]));
    ctx.lineTo(px(n - 1), H);
    ctx.lineTo(px(0), H);
    ctx.closePath();
    ctx.fillStyle = FILL_COLOR;
    ctx.fill();

    // Линия
    ctx.beginPath();
    ctx.moveTo(px(0), py(values[0]));
    for (let i = 1; i < n; i++) ctx.lineTo(px(i), py(values[i]));
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Точки
    values.forEach((v, i) => {
      const isHov = hoveredIdx === i;
      if (!isHov) return; // рисуем только hover-точку
      ctx.beginPath();
      ctx.arc(px(i), py(v), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = DOT_HOVER_COLOR;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [values, n]);

  useEffect(() => { drawFrame(hovIdxRef.current); }, [drawFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => drawFrame(hovIdxRef.current));
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [drawFrame]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    // Находим ближайшую точку по X
    let closest = null;
    let minDist = Infinity;
    pointsRef.current.forEach((p) => {
      const d = Math.abs(mx - p.x);
      if (d < minDist) { minDist = d; closest = p; }
    });
    if (closest && minDist < 20) {
      if (hovIdxRef.current !== closest.index) {
        hovIdxRef.current = closest.index;
        setHovered({ index: closest.index, x: closest.x, y: closest.y });
        drawFrame(closest.index);
      }
    } else {
      if (hovIdxRef.current !== null) {
        hovIdxRef.current = null;
        setHovered(null);
        drawFrame(null);
      }
    }
  };

  const handleMouseLeave = () => {
    hovIdxRef.current = null;
    setHovered(null);
    drawFrame(null);
  };

  return (
    <div className={styles.wrap}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {/* Среднее значение — поверх графика, по центру */}
      <div className={`${styles.overlay} ${hovered ? styles.hidden : ''}`}>
        ⌀ {fmtVal(avg)}
      </div>
      {hovered && dates[hovered.index] && (
        <div className={styles.tooltip} style={{ left: hovered.x, top: hovered.y }}>
          <span className={styles.ttDate}>{format(dates[hovered.index], 'dd.MM')}</span>
          <span className={styles.ttVal}>{fmtVal(values[hovered.index])}</span>
        </div>
      )}
    </div>
  );
};

export default MiniLineChart;
