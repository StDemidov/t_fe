import { useEffect, useRef, useState } from 'react';
import styles from './AbTestCreateModal.module.css';

/**
 * Артикул карточки с бегущей строкой при наведении.
 *
 * Текст дублируется только если он реально не помещается — тогда по наведению
 * он прокручивается слева направо. Клик копирует артикул в буфер.
 *
 * @param {object} props
 * @param {string} props.vendorCode артикул
 */
const CardArticle = ({ vendorCode }) => {
  const singleRef = useRef(null);
  const containerRef = useRef(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const check = () => {
      if (!singleRef.current || !containerRef.current) return;
      setOverflowing(
        singleRef.current.scrollWidth > containerRef.current.clientWidth
      );
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [vendorCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(vendorCode));
    } catch {
      return;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.articleMarquee} ${overflowing ? styles.marquee : ''}`}
      onClick={handleCopy}
      title="Скопировать артикул"
    >
      <span className={styles.articleText}>
        <span ref={singleRef} className={styles.articleTextItem}>
          {vendorCode || '—'}
        </span>
        {overflowing ? (
          <span className={styles.articleTextItem}>{vendorCode}</span>
        ) : null}
      </span>
    </div>
  );
};

export default CardArticle;