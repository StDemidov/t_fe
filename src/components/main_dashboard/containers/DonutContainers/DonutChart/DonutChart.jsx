import { useRef, useEffect, useState, useCallback } from 'react';
import styles from './DonutChart.module.css';

// 20 различимых цветов — перекрытий больше не будет
const COLORS = [
  '#7F77DD', '#4FC3A1', '#D4537E', '#EF9F27', '#534AB7',
  '#1D9E75', '#D85A30', '#888780', '#3B82F6', '#F59E0B',
  '#10B981', '#EC4899', '#8B5CF6', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#E11D48', '#A3A3A3',
];

const lerp = (a, b, t) => a + (b - a) * t;

const fmtRub = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} млн ₽`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)} тыс ₽`;
  return `${n} ₽`;
};

const fmtNum = (n) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);

const SK_WIDTHS = ['85%', '65%', '75%', '55%', '70%', '80%', '60%', '72%'];

export const DonutSkeleton = () => (
  <div className={styles.skeleton}>
    <div className={styles.skCircle} />
    <div className={styles.skLines}>
      {SK_WIDTHS.map((w, i) => (
        <div key={i} className={styles.skRow}>
          <div className={styles.skDot} />
          <div className={styles.skLine} style={{ width: w }} />
        </div>
      ))}
    </div>
  </div>
);

const DonutChart = ({
  data = {},
  isLoading = false,
  title = 'Выручка и выкупы',
}) => {
  const canvasRef = useRef(null);
  const [hoveredName, setHoveredName] = useState(null);
  const segmentsRef = useRef([]);

  // Анимация: радиус каждого сегмента и его alpha
  const radiiRef = useRef([]);   // текущий outerR каждого (0..1 от нормы)
  const alphasRef = useRef([]);  // текущая прозрачность (0.28..1)
  const animRef = useRef(null);
  const hovNameRef = useRef(null);

  // Исключаем "Всего" и категории где оба значения нулевые
  const rawEntries = Object.entries(data)
    .filter(([name]) => name !== 'Всего')
    .map(([name, v], i) => ({
      name,
      money: v?.income ?? v?.invested ?? 0,
      count: v?.buyout ?? v?.stocks ?? 0,
      color: COLORS[i % COLORS.length],
    }))
    .filter((e) => e.money !== 0 || e.count !== 0);

  // Сортируем от большего к меньшему
  const entries = [...rawEntries].sort((a, b) => b.money - a.money);

  // Итог из поля "Всего" или считаем сами
  const totalEntry = data['Всего'];
  const totalMoney = totalEntry
    ? (totalEntry.income ?? totalEntry.invested ?? 0)
    : entries.reduce((s, e) => s + e.money, 0);
  const totalCount = totalEntry
    ? (totalEntry.buyout ?? totalEntry.stocks ?? 0)
    : entries.reduce((s, e) => s + e.count, 0);
  const grandTotal = entries.reduce((s, e) => s + e.money, 0) || 1;

  const biggest = entries[0] ?? null;
  const shownName = hoveredName ?? biggest?.name ?? null;
  const shown = entries.find((e) => e.name === shownName) ?? null;

  // Инициализируем массивы анимации при смене данных
  useEffect(() => {
    radiiRef.current = entries.map(() => 1);
    alphasRef.current = entries.map(() => 1);
  }, [entries.length]);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || entries.length === 0) return;
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.offsetWidth;
    if (!size) return;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2;
    const baseOuter = size * 0.44;
    const hoverExtra = size * 0.06; // максимальное выступание при ховере
    const innerR = size * 0.27;
    const GAP = 0.018;

    segmentsRef.current = [];
    let angle = -Math.PI / 2;

    entries.forEach((entry, i) => {
      const sweep = (entry.money / grandTotal) * (2 * Math.PI - GAP * entries.length);
      const start = angle + GAP / 2;
      const end = angle + sweep + GAP / 2;

      const rScale = radiiRef.current[i] ?? 1;
      const r = baseOuter + hoverExtra * (rScale - 1) * -1 + hoverExtra * (rScale);
      // Упрощённо: r = baseOuter + hoverExtra * (rScale - 1 + 1) слишком сложно
      // Используем: baseOuter + выступ * (rScale - 1) где rScale идёт 1→0 при dim
      // Пересчитаем: hoveredName есть → для активного rScale→1.15, для остальных→1.0
      const outerR = baseOuter + hoverExtra * ((radiiRef.current[i] ?? 1) - 1);

      const alpha = alphasRef.current[i] ?? 1;
      ctx.globalAlpha = alpha;

      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(innerR + 1, outerR), start, end);
      ctx.arc(cx, cy, innerR, end, start, true);
      ctx.closePath();
      ctx.fillStyle = entry.color;
      ctx.fill();
      ctx.globalAlpha = 1;

      segmentsRef.current.push({ ...entry, start, end });
      angle += sweep + GAP;
    });
  }, [entries, grandTotal]);

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
    const SPEED = 0.14;
    const tick = () => {
      const hi = hovNameRef.current;
      let dirty = false;

      entries.forEach((entry, i) => {
        // alpha: активный → 1, остальные при ховере → 0.28, без ховера → 1
        const targetAlpha = hi === null ? 1 : hi === entry.name ? 1 : 0.28;
        const a = alphasRef.current[i] ?? 1;
        const nextA = lerp(a, targetAlpha, SPEED);
        if (Math.abs(nextA - a) > 0.003) { alphasRef.current[i] = nextA; dirty = true; }
        else alphasRef.current[i] = targetAlpha;

        // radius scale: активный → 1.15 (выступ), остальные → 1.0
        const targetR = hi === null ? 1 : hi === entry.name ? 1.15 : 1.0;
        const r = radiiRef.current[i] ?? 1;
        const nextR = lerp(r, targetR, SPEED);
        if (Math.abs(nextR - r) > 0.001) { radiiRef.current[i] = nextR; dirty = true; }
        else radiiRef.current[i] = targetR;
      });

      drawFrame();
      animRef.current = dirty ? requestAnimationFrame(tick) : null;
    };
    animRef.current = requestAnimationFrame(tick);
  }, [entries, drawFrame]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const size = canvas.offsetWidth;
    const cx = size / 2, cy = size / 2;
    const mx = e.clientX - rect.left - cx;
    const my = e.clientY - rect.top - cy;
    const dist = Math.hypot(mx, my);
    // Расширяем зону: учитываем максимальный выступ
    const maxOuter = size * 0.44 + size * 0.06 + 6;
    if (dist < size * 0.27 || dist > maxOuter) {
      if (hovNameRef.current !== null) {
        hovNameRef.current = null;
        setHoveredName(null);
        if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
        startAnimation();
      }
      return;
    }
    let a = Math.atan2(my, mx);
    if (a < -Math.PI / 2) a += 2 * Math.PI;
    const seg = segmentsRef.current.find(({ start, end }) => {
      let s = start, f = end;
      if (s < -Math.PI / 2) { s += 2 * Math.PI; f += 2 * Math.PI; }
      return a >= s && a <= f;
    });
    const newName = seg?.name ?? null;
    if (newName !== hovNameRef.current) {
      hovNameRef.current = newName;
      setHoveredName(newName);
      if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
      startAnimation();
    }
  };

  const handleMouseLeave = () => {
    if (hovNameRef.current !== null) {
      hovNameRef.current = null;
      setHoveredName(null);
      if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
      startAnimation();
    }
  };

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>{title}</div>
        <DonutSkeleton />
      </div>
    );
  }

  if (entries.length === 0) return null;

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>{title}</div>

      <div className={styles.body}>
        {/* ── Donut ── */}
        <div className={styles.chartWrap}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            role="img"
            aria-label={`Кольцевая диаграмма: ${title}`}
          />
          {shown && (
            <div className={styles.center}>
              <span className={styles.cName}>{shown.name}</span>
              <span className={styles.cVal}>{fmtRub(shown.money)}</span>
              {hoveredName && (
                <span className={styles.cSub}>{fmtNum(shown.count)} шт.</span>
              )}
            </div>
          )}
        </div>

        {/* ── Легенда справа ── */}
        <div className={styles.legendWrap}>
          {/* Шапка "Всего" — фиксированная, не прокручивается */}
          <div className={styles.legendHeader}>
            <span className={styles.legendHeaderLabel}>Всего</span>
            <span className={styles.legendHeaderBadge}>
              {fmtRub(totalMoney)}
            </span>
            {totalCount > 0 && (
              <span className={`${styles.legendHeaderBadge} ${styles.legendHeaderBadgeSec}`}>
                {fmtNum(totalCount)} шт.
              </span>
            )}
          </div>

          {/* Список категорий — прокручивается */}
          <div className={styles.legend}>
            {entries.map((e) => (
              <div
                key={e.name}
                className={`${styles.legRow} ${
                  hoveredName === e.name ? styles.legActive : ''
                }`}
                onMouseEnter={() => {
                  hovNameRef.current = e.name;
                  setHoveredName(e.name);
                  if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
                  startAnimation();
                }}
                onMouseLeave={() => {
                  hovNameRef.current = null;
                  setHoveredName(null);
                  if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
                  startAnimation();
                }}
              >
                <span className={styles.legDot} style={{ background: e.color }} />
                <span className={styles.legName}>{e.name}</span>
                <span className={styles.legPct}>
                  {((e.money / grandTotal) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
