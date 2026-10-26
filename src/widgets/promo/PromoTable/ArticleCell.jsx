import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TiFilter } from 'react-icons/ti';
import { FaCheck } from 'react-icons/fa6';
import styles from './PromoTable.module.css';

/**
 * Ячейка колонки «Артикул»: фото слева, справа vendorCode (бегущая строка),
 * а под ним — плашка SKU, плашка категории с иконкой фильтра и плашка
 * лекала с иконкой фильтра (как в «Товарах»).
 *
 * Клик по vendorCode копирует артикул и показывает подсказку «Скопировано»
 * возле курсора. Плашка SKU копирует номер с анимацией внутри плашки.
 * Иконки фильтра выставляют категорию/лекало в фильтры страницы.
 *
 * Если передан canSelect, клик по фото переключает выбор кампании: поверх
 * фото появляется затемнение и галочка.
 *
 * @param {object} props
 * @param {object} props.item — рекламная кампания
 * @param {(category: string) => void} [props.onCategoryFilter]
 * @param {(pattern: string) => void} [props.onPatternFilter]
 * @param {boolean} [props.canSelect] — разрешён ли выбор кампаний
 * @param {boolean} [props.isSelected] — выбрана ли кампания
 * @param {() => void} [props.onToggleSelect] — переключает выбор
 */
const ArticleCell = ({
  item,
  onCategoryFilter,
  onPatternFilter,
  canSelect = false,
  isSelected = false,
  onToggleSelect,
}) => {
  const singleRef = useRef(null);
  const containerRef = useRef(null);
  const [overflowing, setOverflowing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [skuCopied, setSkuCopied] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const timerRef = useRef(null);
  const skuTimerRef = useRef(null);

  const vendorCode = item.vendorcode;

  useEffect(() => {
    const check = () => {
      if (singleRef.current && containerRef.current) {
        setOverflowing(
          singleRef.current.scrollWidth > containerRef.current.clientWidth
        );
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [vendorCode]);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(skuTimerRef.current);
    };
  }, []);

  const handleCopyVendor = async (e) => {
    if (vendorCode == null) return;
    try {
      await navigator.clipboard.writeText(String(vendorCode));
    } catch {
      return;
    }
    setTooltipPos({ top: e.clientY - 10, left: e.clientX + 10 });
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1000);
  };

  const handleCopySku = async () => {
    if (item.sku == null) return;
    try {
      await navigator.clipboard.writeText(String(item.sku));
    } catch {
      return;
    }
    setSkuCopied(true);
    clearTimeout(skuTimerRef.current);
    skuTimerRef.current = setTimeout(() => setSkuCopied(false), 1000);
  };

  return (
    <div className={styles.articleCell}>
      {item.image ? (
        <span
          className={`${styles.articlePhotoWrap} ${canSelect ? styles.articlePhotoSelectable : ''}`}
          onClick={
            canSelect
              ? (e) => {
                  e.stopPropagation();
                  onToggleSelect && onToggleSelect(item.id);
                }
              : undefined
          }
          title={canSelect ? 'Выбрать кампанию' : undefined}
        >
          <img
            className={styles.articlePhoto}
            src={item.image}
            alt={vendorCode || ''}
            loading="lazy"
          />
          {canSelect ? (
            <span
              className={`${styles.photoOverlay} ${isSelected ? styles.photoOverlayVisible : ''}`}
            >
              <span className={styles.photoCheck}>
                <FaCheck />
              </span>
            </span>
          ) : null}
        </span>
      ) : null}
      <div className={styles.articleInfo}>
        <div
          ref={containerRef}
          className={`${styles.articleMarquee} ${overflowing ? styles.marquee : ''}`}
          onClick={handleCopyVendor}
          title="Скопировать артикул"
        >
          <span className={styles.articleText}>
            <span ref={singleRef} className={styles.articleTextItem}>
              {vendorCode ?? '—'}
            </span>
            {overflowing ? (
              <span className={styles.articleTextItem}>{vendorCode}</span>
            ) : null}
          </span>
        </div>
        <div className={styles.badgesRow}>
          {item.sku != null ? (
            <span
              className={styles.skuBadge}
              onClick={handleCopySku}
              title="Скопировать SKU"
            >
              <span className={styles.badgeSlideWrap}>
                <span
                  className={`${styles.badgeSlide} ${skuCopied ? styles.badgeSlideCopied : ''}`}
                >
                  <span className={styles.badgeSlideItem}>{item.sku}</span>
                  <span className={styles.badgeSlideItem}>Скопировано</span>
                </span>
              </span>
            </span>
          ) : null}
          {item.category ? (
            <span className={styles.categoryBadge}>
              <span className={styles.categoryLabel}>{item.category}</span>
              <button
                type="button"
                className={styles.categoryFilter}
                title="Фильтровать по категории"
                aria-label={`Фильтровать по категории ${item.category}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryFilter && onCategoryFilter(item.category);
                }}
              >
                <TiFilter />
              </button>
            </span>
          ) : null}
          <span className={styles.patternBadge}>
            <span className={styles.categoryLabel}>
              {item.pattern || 'Не определено'}
            </span>
            <button
              type="button"
              className={styles.categoryFilter}
              title="Фильтровать по лекалу"
              aria-label={`Фильтровать по лекалу ${item.pattern || 'Не определено'}`}
              onClick={(e) => {
                e.stopPropagation();
                onPatternFilter && onPatternFilter(item.pattern || '');
              }}
            >
              <TiFilter />
            </button>
          </span>
        </div>
      </div>

      {copied
        ? createPortal(
            <span className={styles.vendorToast} style={tooltipPos}>
              Скопировано
            </span>,
            document.body
          )
        : null}
    </div>
  );
};

export default ArticleCell;
