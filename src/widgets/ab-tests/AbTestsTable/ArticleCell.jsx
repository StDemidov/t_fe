import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CopyBadge from './CopyBadge';
import styles from './AbTestsTable.module.css';

/**
 * Ячейка колонки «Артикул»: бегущая строка с vendorCode (как в таблице
 * «Товары») и под ней плашка SKU. Клик по vendorCode копирует артикул
 * в буфер и показывает подсказку «Скопировано» возле курсора.
 *
 * @param {object} props
 * @param {string|number} props.vendorCode артикул
 * @param {string|number} props.sku SKU
 */
const ArticleCell = ({ vendorCode, sku }) => {
  const singleRef = useRef(null);
  const containerRef = useRef(null);
  const [overflowing, setOverflowing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const timerRef = useRef(null);

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
    return () => clearTimeout(timerRef.current);
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

  return (
    <div className={styles.articleCell}>
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
          <CopyBadge value={sku} title="Скопировать SKU" />
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