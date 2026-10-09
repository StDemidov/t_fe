import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { MdOutlineImageNotSupported } from 'react-icons/md';
import styles from './AbTestStatsModal.module.css';

/**
 * CTR фотографии в процентах: clicks / views * 100, 2 знака.
 * @returns {number|null} null, если views не положительное число
 */
const ctrPercent = (photo) => {
  const views = Number(photo.views);
  const clicks = Number(photo.clicks);
  if (!Number.isFinite(views) || views <= 0 || !Number.isFinite(clicks))
    return null;
  return (clicks / views) * 100;
};

/** Одна фотография теста с подписью: показы, клики и CTR. */
const StatsPhoto = ({ photo, ctr, isHighlighted, isTopCtr, badgeText }) => (
  <div className={styles.photoCard}>
    <div
      className={`${styles.photoWrap} ${
        isHighlighted ? styles.photoWinner : ''
      }`}
    >
      {photo.photo ? (
        <img
          className={styles.photo}
          src={photo.photo}
          alt=""
          loading="lazy"
          decoding="async"
        />
      ) : (
        <MdOutlineImageNotSupported className={styles.photoIcon} />
      )}

      {isHighlighted && badgeText && (
        <span className={styles.winnerBadge}>{badgeText}</span>
      )}
    </div>

    <div className={`${styles.stats} ${isTopCtr ? styles.statsWinner : ''}`}>
      <span className={styles.stat}>
        <span className={styles.statLabel}>Показы</span>
        <span className={styles.statValue}>{photo.views ?? 0}</span>
      </span>
      <span className={styles.stat}>
        <span className={styles.statLabel}>Клики</span>
        <span className={styles.statValue}>{photo.clicks ?? 0}</span>
      </span>
      <span className={styles.stat}>
        <span className={styles.statLabel}>CTR</span>
        <span className={styles.statValue}>
          {ctr == null ? '—' : `${ctr.toFixed(2)} %`}
        </span>
      </span>
    </div>
  </div>
);

/**
 * Окно статистики A/B теста.
 *
 * Все фотографии теста выводятся в ряд с горизонтальной прокруткой.
 * Под каждой — показы, клики и CTR.
 *
 * Для раздела «Завершенные» победитель выделен рамкой и зелёной подписью
 * «Победитель», у остальных статус CTR красный.
 * Для раздела «Активные» плашка «Тестируется» — фото с isCurrentlyTesting,
 * а зелёным подсвечиваются статусы фото с максимальным CTR.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object} props.test нормализованный тест
 * @param {'finished'|'active'} [props.variant] раздел, из которого открыли
 */
const AbTestStatsModal = ({ open, onClose, test, variant = 'finished' }) => {
  // Закрытие по Escape.
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !test) return null;

  const photos = test.photos || [];

  // В «Активных» нет победителя: зелёные статусы у максимального CTR.
  const maxCtr = photos.reduce((max, photo) => {
    const ctr = ctrPercent(photo);
    return ctr != null && ctr > max ? ctr : max;
  }, -Infinity);

  const isActive = variant === 'active';

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Статистика теста"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.title}>Статистика теста</span>
            <span className={styles.subtitle}>
              {test.vendorCode} · {test.sku}
            </span>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            title="Закрыть"
            aria-label="Закрыть окно"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <div className={styles.content}>
          {photos.length === 0 ? (
            <div className={styles.state}>В тесте нет фотографий</div>
          ) : (
            <div className={styles.photosRow}>
              {photos.map((photo, i) => {
                const ctr = ctrPercent(photo);
                const isHighlighted = isActive
                  ? Boolean(photo.isCurrentlyTesting)
                  : Boolean(photo.isWinner);
                const isTopCtr = isActive
                  ? ctr != null && ctr === maxCtr
                  : Boolean(photo.isWinner);
                return (
                  <StatsPhoto
                    key={`${test.id}-stats-${i}`}
                    photo={photo}
                    ctr={ctr}
                    isHighlighted={isHighlighted}
                    isTopCtr={isTopCtr}
                    badgeText={isActive ? 'Тестируется' : 'Победитель'}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AbTestStatsModal;