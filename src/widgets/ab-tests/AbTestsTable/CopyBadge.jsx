import { useEffect, useRef, useState } from 'react';
import styles from './AbTestsTable.module.css';

/**
 * Плашка со значением, которая копирует его в буфер по клику
 * (как плашка SKU во вкладке «Товары»): внутри плашки текст
 * прокручивается вверх и показывает «Скопировано».
 *
 * @param {object} props
 * @param {string|number} props.value значение плашки
 * @param {string} [props.title] подсказка
 * @param {string} [props.className] дополнительный класс
 */
const CopyBadge = ({ value, title = 'Скопировать', className = '' }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  if (value == null || value === '') {
    return <span className={styles.dash}>—</span>;
  }

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(String(value));
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1000);
  };

  return (
    <span
      className={`${styles.copyBadge} ${className}`}
      onClick={handleCopy}
      title={title}
    >
      <span className={styles.badgeSlideWrap}>
        <span
          className={`${styles.badgeSlide} ${copied ? styles.badgeSlideCopied : ''}`}
        >
          <span className={styles.badgeSlideItem}>{value}</span>
          <span className={styles.badgeSlideItem}>Скопировано</span>
        </span>
      </span>
    </span>
  );
};

export default CopyBadge;