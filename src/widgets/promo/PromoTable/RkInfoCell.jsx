import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TiFilter } from 'react-icons/ti';
import styles from './PromoTable.module.css';

/** Дата в формате DD.MM.YYYY; пустая строка, если значения нет. */
const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
};

/** Человекочитаемый тип кампании: manual → «Ручная», unified → «Единая». */
const BID_TYPE_LABELS = {
  manual: 'Ручная',
  unified: 'Единая',
};

/**
 * Ячейка колонки «Информация об РК»: название кампании бегущей строкой
 * (клик копирует), плашка ID кампании на Wildberries (копируется, как SKU),
 * плашка типа кампании (Ручная/Единая, инвертированные цвета, с фильтром),
 * дата старта (creationDatetime), а у завершённых — дата завершения
 * (endDatetime, показывается когда поле есть).
 *
 * Если передан compact, показываются только название и тип кампании
 * (без ID и дат) — для раздела «В обработке».
 *
 * @param {object} props
 * @param {object} props.item — рекламная кампания
 * @param {(bidType: string) => void} [props.onBidTypeFilter] выставляет
 *   тип кампании в фильтр страницы
 * @param {boolean} [props.compact] компактный режим: только name и bidType
 */
const RkInfoCell = ({ item, onBidTypeFilter, compact = false }) => {
  const singleRef = useRef(null);
  const containerRef = useRef(null);
  const [overflowing, setOverflowing] = useState(false);
  const [nameCopied, setNameCopied] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const nameTimerRef = useRef(null);
  const idTimerRef = useRef(null);

  const name = item.name;

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
  }, [name]);

  useEffect(() => {
    return () => {
      clearTimeout(nameTimerRef.current);
      clearTimeout(idTimerRef.current);
    };
  }, []);

  const handleCopyName = async (e) => {
    if (name == null) return;
    try {
      await navigator.clipboard.writeText(String(name));
    } catch {
      return;
    }
    setTooltipPos({ top: e.clientY - 10, left: e.clientX + 10 });
    setNameCopied(true);
    clearTimeout(nameTimerRef.current);
    nameTimerRef.current = setTimeout(() => setNameCopied(false), 1000);
  };

  const handleCopyId = async () => {
    if (item.wbCampId == null) return;
    try {
      await navigator.clipboard.writeText(String(item.wbCampId));
    } catch {
      return;
    }
    setIdCopied(true);
    clearTimeout(idTimerRef.current);
    idTimerRef.current = setTimeout(() => setIdCopied(false), 1000);
  };

  return (
    <div className={styles.rkInfoCell}>
      <div
        ref={containerRef}
        className={`${styles.articleMarquee} ${overflowing ? styles.marquee : ''}`}
        onClick={handleCopyName}
        title="Скопировать название"
      >
        <span className={styles.articleText}>
          <span ref={singleRef} className={styles.articleTextItem}>
            {name ?? '—'}
          </span>
          {overflowing ? (
            <span className={styles.articleTextItem}>{name}</span>
          ) : null}
        </span>
      </div>
      <div className={styles.rkBadgeRow}>
        {!compact && item.wbCampId != null ? (
          <span
            className={styles.wbCampBadge}
            onClick={handleCopyId}
            title="Скопировать ID кампании"
          >
            <span className={styles.badgeSlideWrap}>
              <span
                className={`${styles.badgeSlide} ${idCopied ? styles.badgeSlideCopied : ''}`}
              >
                <span className={styles.badgeSlideItem}>{item.wbCampId}</span>
                <span className={styles.badgeSlideItem}>Скопировано</span>
              </span>
            </span>
          </span>
        ) : null}
        {BID_TYPE_LABELS[item.bidType] ? (
          <span className={styles.bidTypeBadge}>
            <span className={styles.categoryLabel}>
              {BID_TYPE_LABELS[item.bidType]}
            </span>
            <button
              type="button"
              className={styles.categoryFilter}
              title="Фильтровать по типу кампании"
              aria-label={`Фильтровать по типу кампании ${BID_TYPE_LABELS[item.bidType]}`}
              onClick={(e) => {
                e.stopPropagation();
                onBidTypeFilter && onBidTypeFilter(item.bidType);
              }}
            >
              <TiFilter />
            </button>
          </span>
        ) : null}
      </div>
      {!compact ? (
        <div className={styles.rkDates}>
          <span>Старт: {formatDate(item.creationDatetime) || '—'}</span>
          {item.endDatetime ? (
            <span>Завершение: {formatDate(item.endDatetime) || '—'}</span>
          ) : null}
        </div>
      ) : null}

      {nameCopied
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

export default RkInfoCell;
