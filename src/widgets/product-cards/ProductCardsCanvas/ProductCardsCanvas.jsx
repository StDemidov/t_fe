import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProductCardWidget from '../ProductCardWidget';
import FreeProductsDock from '../FreeProductsDock';
import { FREE_GROUP_ID, getCardStats } from '../../../entities/product-card';
import styles from './ProductCardsCanvas.module.css';

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 2;
const ZOOM_STEP = 1.15;
/** Накопление дельты колеса, при достижении которой срабатывает один шаг зума. */
const WHEEL_STEP = 30;
/** Ограничение числа шагов за одно событие, чтобы быстрый «щёлчок» не прыгал. */
const MAX_STEPS_PER_EVENT = 3;
/** Масштаб изначальной отрисовки — док свободных товаров (2× вьюпорт) во всю ширину. */
const INITIAL_ZOOM = 0.5;
/** Ширина плоскости в кратности к ширине вьюпорта (док свободных товаров в 2 раза шире). */
const CONTENT_WIDTH_MULT = 2;

/**
 * Холст карточек в духе миро: безграничная плоскость с панорамированием
 * (перетаскивание мышью / колесо) и зумом (кнопки / Ctrl+Cmd+колесо).
 *
 * Раскладка фиксируется один раз: ширина плоскости = ширине вьюпорта.
 * Зум только масштабирует содержимое через transform и НЕ перестраивает
 * карточки по рядам. Пан и трансформация обновляются напрямую через DOM
 * (без ре-рендера), поэтому при движении содержимое не перерисовывается.
 *
 * @param {object} props
 * @param {Array<{ id: number, skus: Array<object> }>} props.groups
 * @param {Array<{ abc: string, skus: Array<object> }>} props.freeGroups
 * @param {boolean} [props.showFreeProducts] — показывать ли док свободных товаров
 * @param {boolean} [props.showEmptyCards] — показывать ли секцию карточек без остатков
 * @param {string} [props.skuSort] — сортировка артикулов внутри карточек
 */
const ProductCardsCanvas = ({
  groups,
  freeGroups,
  showFreeProducts,
  showEmptyCards,
  skuSort,
}) => {
  const viewportRef = useRef(null);
  const worldRef = useRef(null);

  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const viewportSizeRef = useRef({ width: 0, height: 0 });
  const dragRef = useRef(null);
  const wheelAccumRef = useRef(0);
  const didFitRef = useRef(false);

  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  // Карточки без товаров на складах переносим в отдельную секцию в конец.
  const { liveGroups, deadGroups } = useMemo(() => {
    const live = [];
    const dead = [];
    for (const group of groups) {
      if (group.id === FREE_GROUP_ID) continue;
      const { totalStock } = getCardStats(group.skus);
      (totalStock > 0 ? live : dead).push(group);
    }
    return { liveGroups: live, deadGroups: dead };
  }, [groups]);

  const applyTransform = useCallback(() => {
    const world = worldRef.current;
    if (!world) return;
    const { x, y } = panRef.current;
    const scale = zoomRef.current;
    world.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }, []);

  /** Масштабирует относительно точки курсора (или центра вьюпорта). */
  const setZoomValue = useCallback(
    (next, cursorX, cursorY) => {
      const scale = zoomRef.current;
      const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
      const cx =
        cursorX ?? viewportSizeRef.current.width / 2;
      const cy =
        cursorY ?? viewportSizeRef.current.height / 2;
      const { x, y } = panRef.current;
      const worldX = (cx - x) / scale;
      const worldY = (cy - y) / scale;
      zoomRef.current = clamped;
      panRef.current = { x: cx - worldX * clamped, y: cy - worldY * clamped };
      setZoom(clamped);
      applyTransform();
    },
    [applyTransform]
  );

  const zoomBy = useCallback(
    (factor) => {
      wheelAccumRef.current = 0;
      setZoomValue(zoomRef.current * factor);
    },
    [setZoomValue]
  );

  const resetView = useCallback(() => {
    zoomRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    setZoom(1);
    applyTransform();
  }, [applyTransform]);

  /**
   * Возвращает вид «как только открыли страницу»: фиксированный отдалённый
   * масштаб и центрирование. Фильтры не трогает — они вне этого компонента.
   */
  const fitInitial = useCallback(() => {
    requestAnimationFrame(() => {
      const world = worldRef.current;
      const { width: vw, height: vh } = viewportSizeRef.current;
      if (!world || !vw || !vh) return;
      const s = INITIAL_ZOOM;
      const worldWidth = world.offsetWidth || vw * CONTENT_WIDTH_MULT;
      zoomRef.current = s;
      panRef.current = {
        x: (vw - worldWidth * s) / 2,
        // Док должен быть виден у верхнего края, если контент выше вьюпорта.
        y: Math.max(0, (vh - world.scrollHeight * s) / 2),
      };
      setZoom(s);
      applyTransform();
    });
  }, [applyTransform]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const ro = new ResizeObserver(() => {
      const rect = viewport.getBoundingClientRect();
      viewportSizeRef.current = {
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
      };
      worldRef.current.style.width = `${rect.width * CONTENT_WIDTH_MULT}px`;
      applyTransform();
    });
    ro.observe(viewport);
    return () => ro.disconnect();
  }, [applyTransform]);

  // При первой загрузке данных показываем весь холст на фиксированном отдалённом масштабе.
  useEffect(() => {
    const hasContent = groups.length > 0 || (freeGroups?.length ?? 0) > 0;
    if (hasContent && !didFitRef.current) {
      didFitRef.current = true;
      fitInitial();
    }
  }, [groups, freeGroups, fitInitial]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onWheel = (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Координаты курсора относительно вьюпорта берём из кэша —
        // getBoundingClientRect на каждом событии вызывает синхронный layout.
        const { left, top } = viewportSizeRef.current;
        // Трекпад шлёт дробные deltaY сотнями событий — накапливаем и
        // срабатываем только фиксированными шагами, чтобы не лагало.
        // Нормализуем deltaMode (Firefox шлёт дельту в «строках»).
        const raw =
          e.deltaMode === 1
            ? e.deltaY * 33
            : e.deltaMode === 2
              ? e.deltaY * viewportSizeRef.current.height
              : e.deltaY;
        wheelAccumRef.current += raw;
        const rawSteps = Math.trunc(wheelAccumRef.current / WHEEL_STEP);
        const steps = Math.max(
          -MAX_STEPS_PER_EVENT,
          Math.min(MAX_STEPS_PER_EVENT, rawSteps)
        );
        if (steps !== 0) {
          wheelAccumRef.current -= steps * WHEEL_STEP;
          setZoomValue(
            zoomRef.current * Math.pow(ZOOM_STEP, -steps),
            e.clientX - left,
            e.clientY - top
          );
        }
      } else {
        panRef.current.x -= e.deltaX;
        panRef.current.y -= e.deltaY;
        applyTransform();
      }
    };
    // onWheel в React пассивный по умолчанию — вешаем нативно для preventDefault
    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheel);
  }, [setZoomValue, applyTransform]);

  const onPointerDown = (e) => {
    // Не перехватываем клики по интерактивным элементам (ссылки, кнопки,
    // полоска sku с копированием), иначе они не сработают и начнётся
    // перетаскивание холста.
    if (e.target.closest('a, button, [data-interactive]')) return;
    e.preventDefault();
    const viewport = viewportRef.current;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    };
    viewport.setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const onPointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    panRef.current.x = drag.panX + (e.clientX - drag.startX);
    panRef.current.y = drag.panY + (e.clientY - drag.startY);
    applyTransform();
  };

  const onPointerUp = (e) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
      setIsDragging(false);
    }
  };

  return (
    <div className={styles.root}>
      <div
        ref={viewportRef}
        className={`${styles.viewport} ${isDragging ? styles.viewportDragging : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div ref={worldRef} className={styles.world}>
          <div className={styles.content}>
            {showFreeProducts && freeGroups?.length > 0 && (
              <FreeProductsDock groups={freeGroups} />
            )}
            <div className={styles.cardsRow}>
              {liveGroups.map((group) => (
                <ProductCardWidget
                  key={group.id}
                  group={group}
                  skuSort={skuSort}
                />
              ))}
            </div>
            {showEmptyCards && deadGroups.length > 0 && (
              <>
                <div className={styles.sectionTitle}>
                  Карточки с товарами, отсутствующими на складах
                </div>
                <div className={styles.cardsRow}>
                  {deadGroups.map((group) => (
                    <ProductCardWidget
                      key={group.id}
                      group={group}
                      skuSort={skuSort}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.controlButton}
          onClick={fitInitial}
          aria-label="Вернуть начальный вид"
          title="Вернуть начальный вид"
        >
          ⟳
        </button>
        <button
          type="button"
          className={styles.controlButton}
          onClick={() => zoomBy(1 / ZOOM_STEP)}
          aria-label="Уменьшить"
        >
          −
        </button>
        <span className={styles.zoomValue}>{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          className={styles.controlButton}
          onClick={() => zoomBy(ZOOM_STEP)}
          aria-label="Увеличить"
        >
          +
        </button>
        <button
          type="button"
          className={styles.controlButton}
          onClick={resetView}
          aria-label="Масштаб 100%"
        >
          100%
        </button>
      </div>
    </div>
  );
};

export default ProductCardsCanvas;
