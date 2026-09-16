import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TiFilter } from 'react-icons/ti';
import SkuPhoto from './SkuPhoto';
import wbLogo from '../../shared/assets/wb_logo.png';
import styles from './SkusTable.module.css';

/** Возвращает класс цвета плашки ABC по значению (A/B/C/AAA/NEW и др.). */
const abcClass = (value) => {
  const key = String(value || '').toLowerCase();
  if (styles[`abc_${key}`]) return styles[`abc_${key}`];
  return styles.abcNeutral;
};

/**
 * Ячейка колонки «Артикул»: фото слева, справа vendorCode (бегущая строка),
 * а под ним — плашка SKU, плашка категории и иконка WB в ряд.
 *
 * Клик по vendorCode копирует содержимое в буфер и показывает подсказку
 * «Скопировано» возле курсора. Плашка SKU копирует номер в буфер с анимацией
 * внутри плашки. Плашка категории — инвертированные цвета, с иконкой фильтра
 * (как у тегов): она выставляет категорию в фильтр «Категория». Без копирования.
 * Иконка WB открывает карточку товара на Wildberries в новой вкладке.
 *
 * @param {object} props
 * @param {object} props.item — товар
 * @param {(category: string) => void} [props.onCategoryFilter] — выставляет
 *   категорию как фильтр.
 * @param {(pattern: string) => void} [props.onPatternFilter] — выставляет
 *   значение лекала как фильтр.
 * @param {(value: string) => void} [props.onAbcAllFilter] — выставляет значение
 *   ABC-плашки (бренд) как фильтр.
 * @param {(value: string) => void} [props.onAbcCategoryFilter] — выставляет
 *   значение ABC-плашки (категория) как фильтр.
 */
const ArticleCell = ({
  item,
  onCategoryFilter,
  onPatternFilter,
  onAbcAllFilter,
  onAbcCategoryFilter,
}) => {
  const singleRef = useRef(null);
  const containerRef = useRef(null);
  const [overflowing, setOverflowing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [vendorCopied, setVendorCopied] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const skuTimerRef = useRef(null);
  const vendorTimerRef = useRef(null);

  useEffect(() => {
    const check = () => {
      if (singleRef.current && containerRef.current) {
        // Ширина ОДНОГО экземпляра текста (не задвоенного для бегущей строки).
        const singleWidth = singleRef.current.scrollWidth;
        setOverflowing(singleWidth > containerRef.current.clientWidth);
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [item.vendorCode]);

  useEffect(() => {
    return () => {
      clearTimeout(skuTimerRef.current);
      clearTimeout(vendorTimerRef.current);
    };
  }, []);

  const handleCopySku = async () => {
    try {
      await navigator.clipboard.writeText(String(item.sku));
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(skuTimerRef.current);
    skuTimerRef.current = setTimeout(() => setCopied(false), 1000);
  };

  const handleCopyVendor = async (e) => {
    try {
      await navigator.clipboard.writeText(String(item.vendorCode));
    } catch {
      return;
    }
    setTooltipPos({ top: e.clientY - 10, left: e.clientX + 10 });
    setVendorCopied(true);
    clearTimeout(vendorTimerRef.current);
    vendorTimerRef.current = setTimeout(() => setVendorCopied(false), 1000);
  };

  return (
    <div className={styles.articleCell}>
      {item.image ? (
        <a
          className={styles.articlePhotoLink}
          href={`/skus/${item.sku}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Открыть страницу товара"
        >
          <SkuPhoto src={item.image} alt={item.vendorCode} rating={item.rating} />
        </a>
      ) : null}
      <div className={styles.articleInfo}>
        <div
          ref={containerRef}
          className={`${styles.articleMarquee} ${overflowing ? styles.marquee : ''}`}
          onClick={handleCopyVendor}
          title="Скопировать vendorCode"
        >
          <span className={styles.articleText}>
            <span ref={singleRef} className={styles.articleTextItem}>
              {item.vendorCode}
            </span>
            {overflowing ? (
              <span className={styles.articleTextItem}>{item.vendorCode}</span>
            ) : null}
          </span>
        </div>
        <div className={styles.badgesRow}>
          <span className={styles.skuBadge} onClick={handleCopySku} title="Скопировать SKU">
            <span className={styles.badgeSlideWrap}>
              <span
                className={`${styles.badgeSlide} ${copied ? styles.badgeSlideCopied : ''}`}
              >
                <span className={styles.badgeSlideItem}>{item.sku}</span>
                <span className={styles.badgeSlideItem}>Скопировано</span>
              </span>
            </span>
          </span>
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
            <span className={styles.categoryLabel}>{item.pattern || 'Не определено'}</span>
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
          <a
            className={styles.wbLogo}
            href={`https://www.wildberries.ru/catalog/${item.sku}/detail.aspx`}
            target="_blank"
            rel="noopener noreferrer"
            title="Открыть на Wildberries"
          >
            <img src={wbLogo} alt="WB" />
          </a>
        </div>
        {/* Ряд ABC: буква (Б/К) + плашка текущего ABC-значения с фильтром. */}
        <div className={styles.abcRow}>
          <span className={styles.abcLetter}>Б</span>
          <span className={`${styles.abcBadge} ${abcClass(item.abcAmongAllCurrent)}`}>
            {item.abcAmongAllCurrent || '—'}
            <button
              type="button"
              className={styles.abcFilter}
              title="Фильтровать по ABC (бренд)"
              aria-label={`Фильтровать по ABC (бренд) ${item.abcAmongAllCurrent || ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onAbcAllFilter && onAbcAllFilter(item.abcAmongAllCurrent);
              }}
            >
              <TiFilter />
            </button>
          </span>
          <span className={styles.abcLetter}>К</span>
          <span
            className={`${styles.abcBadge} ${abcClass(item.abcAmongCategoryCurrent)}`}
          >
            {item.abcAmongCategoryCurrent || '—'}
            <button
              type="button"
              className={styles.abcFilter}
              title="Фильтровать по ABC (кат.)"
              aria-label={`Фильтровать по ABC (кат.) ${item.abcAmongCategoryCurrent || ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onAbcCategoryFilter && onAbcCategoryFilter(item.abcAmongCategoryCurrent);
              }}
            >
              <TiFilter />
            </button>
          </span>
        </div>
        <div className={styles.startDate}>
          Дата старта продаж: {item.startOfRealizationDate || '—'}
        </div>
      </div>

      {vendorCopied
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
