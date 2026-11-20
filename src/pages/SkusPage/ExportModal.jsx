import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaCheckCircle, FaFileExcel } from 'react-icons/fa';
import styles from './ExportModal.module.css';

/**
 * Модалка выгрузки в Excel. Три состояния:
 * - choose — выбор «все данные» / «отфильтрованные артикулы»;
 * - loading — «Формирование отчёта…» (закрыть нельзя);
 * - success — «Началось скачивание файла» с галочкой (родитель закрывает
 *   сам через полторы секунды).
 *
 * @param {object} props
 * @param {'choose'|'loading'|'success'|null} props.state — null = закрыта
 * @param {() => void} props.onClose
 * @param {(scope: 'all'|'filtered') => void} props.onExport
 */
const ExportModal = ({ state, onClose, onExport }) => {
  const open = state !== null;

  // Закрытие по Escape (кроме состояния загрузки).
  useEffect(() => {
    if (!open || state === 'loading') return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, state, onClose]);

  if (!open) return null;

  const handleOverlayClick = () => {
    if (state !== 'loading') onClose();
  };

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Экспорт в Excel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <span className={styles.title}>Экспорт в Excel</span>
          {state !== 'loading' && (
            <button
              type="button"
              className={styles.closeBtn}
              title="Закрыть"
              aria-label="Закрыть окно"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          )}
        </div>

        {state === 'choose' && (
          <div className={styles.choices}>
            <button
              type="button"
              className={styles.choiceBtn}
              onClick={() => onExport('all')}
            >
              <FaFileExcel className={styles.choiceIcon} />
              Экспортировать все данные
            </button>
            <button
              type="button"
              className={styles.choiceBtn}
              onClick={() => onExport('filtered')}
            >
              <FaFileExcel className={styles.choiceIcon} />
              Экспортировать отфильтрованные артикулы
            </button>
          </div>
        )}

        {state === 'loading' && (
          <div className={styles.status}>
            <span className={styles.spinner} />
            <span>Формирование отчёта…</span>
          </div>
        )}

        {state === 'success' && (
          <div className={`${styles.status} ${styles.statusSuccess}`}>
            <FaCheckCircle className={styles.successIcon} />
            <span>Началось скачивание файла</span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ExportModal;
