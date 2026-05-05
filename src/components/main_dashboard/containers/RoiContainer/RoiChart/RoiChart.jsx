import { useRef, useEffect, useState, useCallback } from 'react';
import styles from './RoiChart.module.css';

const BAR_COLOR = '#7F77DD';
const BAR_COLOR_NEGATIVE = '#D4537E';
const BAR_HOVER = '#534AB7';
const BAR_HOVER_NEGATIVE = '#B03060';
const AXIS_COLOR = 'rgba(83, 74, 183, 0.15)';
const LABEL_COLOR = '#aaa';
const LABEL_HOVER_COLOR = '#534AB7';
const ZERO_LINE = 'rgba(83, 74, 183, 0.35)';

const SK_HEIGHTS = [70, 55, 85, 40, 65, 50, 75, 60, 45, 80];

export const RoiSkeleton = () => (
  <div className={styles.skeleton}>
    {SK_HEIGHTS.map((h, i) => (
      <div
        key={i}
        className={styles.skBar}
        style={{ height: `${h}%`, animationDelay: `${i * 0.07}s` }}
      />
    ))}
  </div>
);

const lerp = (a, b, t) => a + (b - a) * t;

const RoiChart = ({ data = {}, isLoading = false, title = 'ROI по категориям' }) => {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [hovered, setHovered] = useState(null); // { index, x, y, name, value }
  const barsRef = useRef([]);

  // Для плавной анимации: храним текущие alpha каждого бара
  const alphasRef = useRef([]);
  const rafRef = useRef(null);
  const hoveredIndexRef = useRef(null);

  const entries = Object.entries(data)
    .filter(([name]) => name !== 'Всего')
    .map(([name, value]) => ({ name, value }))
    .filter((e) => e.value !== 0);

  const total = data['Всего'] ?? null;

  // Инициализируем alphas при изменении данных
  useEffect(() => {
    alphasRef.current = entries.map(() => 1);
  }, [entries.length]);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || entries.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    if (!W || !H) return;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const PAD_LEFT = 40;
    const PAD_RIGHT = 8;
    const PAD_TOP = 14;

    // Адаптивный нижний отступ — зависит от ширины слота
    const estChartW = W - PAD_LEFT - PAD_RIGHT;
    const estGap = 4;
    const estBarW = Math.max(4, (estChartW - estGap * (entries.length + 1)) / entries.length);
    const slotW = estBarW + estGap;
    // slotW >= 20 → вертикальные подписи (длинные названия)
    // slotW < 20  → подписи скрыты
    const labelMode = slotW >= 20 ? 'vertical' : 'none';
    const PAD_BOTTOM = labelMode === 'vertical' ? 70 : 16;

    const chartW = W - PAD_LEFT - PAD_RIGHT;
    const chartH = H - PAD_TOP - PAD_BOTTOM;

    const values = entries.map((e) => e.value);
    const maxVal = Math.max(...values, 0);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal || 1;

    const zeroY = PAD_TOP + chartH * (maxVal / range);

    // ── Сетка + Y-метки ──
    const gridCount = 5;
    ctx.strokeStyle = AXIS_COLOR;
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridCount; i++) {
      const y = PAD_TOP + (chartH / gridCount) * i;
      ctx.beginPath();
      ctx.moveTo(PAD_LEFT, y);
      ctx.lineTo(W - PAD_RIGHT, y);
      ctx.stroke();

      const labelVal = maxVal - (range / gridCount) * i;
      ctx.fillStyle = LABEL_COLOR;
      ctx.font = `10px system-ui, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(labelVal)}%`, PAD_LEFT - 4, y + 3.5);
    }

    // ── Нулевая линия ──
    if (minVal < 0) {
      ctx.strokeStyle = ZERO_LINE;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(PAD_LEFT, zeroY);
      ctx.lineTo(W - PAD_RIGHT, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ── Столбики ──
    const gap = 4;
    const barW = Math.max(4, (chartW - gap * (entries.length + 1)) / entries.length);

    barsRef.current = [];
    const alphas = alphasRef.current;

    entries.forEach((entry, i) => {
      const x = PAD_LEFT + gap + i * (barW + gap);
      const barH = Math.abs((entry.value / range) * chartH);
      const y = entry.value >= 0 ? zeroY - barH : zeroY;
      const isNeg = entry.value < 0;

      const baseColor = isNeg ? BAR_COLOR_NEGATIVE : BAR_COLOR;
      const hovColor = isNeg ? BAR_HOVER_NEGATIVE : BAR_HOVER;

      // Интерполируем цвет через alpha канал между base и hov
      const alpha = alphas[i] ?? 1;
      ctx.globalAlpha = alpha;

      // Скруглённые углы сверху
      const r = Math.max(0, Math.min(4, barW / 2, barH / 2));
      ctx.beginPath();
      if (entry.value >= 0) {
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + barW - r, y);
        ctx.arcTo(x + barW, y, x + barW, y + r, r);
        ctx.lineTo(x + barW, y + barH);
        ctx.lineTo(x, y + barH);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
      } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x + barW, y);
        ctx.lineTo(x + barW, y + barH - r);
        ctx.arcTo(x + barW, y + barH, x + barW - r, y + barH, r);
        ctx.lineTo(x + r, y + barH);
        ctx.arcTo(x, y + barH, x, y + barH - r, r);
        ctx.lineTo(x, y);
      }
      ctx.closePath();

      // При ховере: рисуем base с alpha, потом hov поверх с (1-alpha)
      ctx.fillStyle = baseColor;
      ctx.fill();

      if (hoveredIndexRef.current === i) {
        ctx.globalAlpha = (1 - alpha) * 0.6 + 0.4; // не даём стать прозрачным полностью
        ctx.fillStyle = hovColor;
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      // ── Подписи OX — только если достаточно места ──
      if (labelMode === 'vertical') {
        ctx.save();
        const labelX = x + barW / 2;
        const labelY = PAD_TOP + chartH + 8;
        ctx.translate(labelX, labelY);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'right';
        ctx.font = `9.5px system-ui, sans-serif`;
        ctx.fillStyle = hoveredIndexRef.current === i ? LABEL_HOVER_COLOR : LABEL_COLOR;
        ctx.fillText(entry.name, 0, 3);
        ctx.restore();
      }

      barsRef.current.push({
        x,
        y: Math.min(y, zeroY),
        w: barW,
        h: barH,
        name: entry.name,
        value: entry.value,
      });
    });
  }, [entries]);

  // Анимационный цикл: плавно интерполируем alphas к целевым значениям
  const animateRef = useRef(null);

  const startAnimation = useCallback(() => {
    if (animateRef.current) return;

    const tick = () => {
      const alphas = alphasRef.current;
      const hi = hoveredIndexRef.current;
      const SPEED = 0.18;
      let needsRedraw = false;

      alphas.forEach((a, i) => {
        const target = hi === null ? 1 : hi === i ? 1 : 0.25;
        const next = lerp(a, target, SPEED);
        if (Math.abs(next - a) > 0.002) {
          alphas[i] = next;
          needsRedraw = true;
        } else {
          alphas[i] = target;
        }
      });

      drawFrame();

      if (needsRedraw) {
        animateRef.current = requestAnimationFrame(tick);
      } else {
        animateRef.current = null;
      }
    };

    animateRef.current = requestAnimationFrame(tick);
  }, [drawFrame]);

  // Первичная отрисовка и при смене данных
  useEffect(() => {
    alphasRef.current = entries.map(() => 1);
    drawFrame();
  }, [drawFrame]);

  // ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => drawFrame());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [drawFrame]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (animateRef.current) cancelAnimationFrame(animateRef.current);
    };
  }, []);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const hit = barsRef.current.findIndex(
      ({ x, y, w, h }) => mx >= x && mx <= x + w && my >= y - 10 && my <= y + h + 10
    );

    const newIndex = hit === -1 ? null : hit;

    if (newIndex !== hoveredIndexRef.current) {
      hoveredIndexRef.current = newIndex;

      if (newIndex === null) {
        setHovered(null);
      } else {
        const bar = barsRef.current[newIndex];
        setHovered({
          index: newIndex,
          x: bar.x + bar.w / 2,
          y: bar.y,
          name: bar.name,
          value: bar.value,
        });
      }

      if (animateRef.current) {
        cancelAnimationFrame(animateRef.current);
        animateRef.current = null;
      }
      startAnimation();
    }
  };

  const handleMouseLeave = () => {
    hoveredIndexRef.current = null;
    setHovered(null);
    if (animateRef.current) {
      cancelAnimationFrame(animateRef.current);
      animateRef.current = null;
    }
    startAnimation();
  };

  const fmtRoi = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
  const isPositive = total !== null && total >= 0;

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>{title}</span>
        </div>
        <RoiSkeleton />
      </div>
    );
  }

  if (entries.length === 0) return null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>{title}</span>

        {total !== null && (
          <div className={styles.badgeGroup}>
            <span className={styles.badgeLabel}>По всем</span>
            <span
              className={`${styles.badgeValue} ${
                isPositive ? styles.badgePositive : styles.badgeNegative
              }`}
            >
              {fmtRoi(total)}
            </span>
          </div>
        )}
      </div>

      <div className={styles.chartWrap} ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          role="img"
          aria-label={`Столбчатая диаграмма: ${title}`}
        />
        {hovered && (
          <div
            className={styles.tooltip}
            style={{ left: hovered.x, top: hovered.y }}
          >
            <span className={styles.tooltipName}>{hovered.name}</span>
            <span className={styles.tooltipValue}>{fmtRoi(hovered.value)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoiChart;
