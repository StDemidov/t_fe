import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import styles from './ConfirmModal.module.css';

/**
 * Подтверждение необратимого действия с A/B тестом (удаление, пауза,
 * запуск, завершение). Запрос к эндпоинту уходит только после нажатия
 * кнопки подтверждения — закрытие окна или «Отмена» ничего не отправляют.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.title заголовок окна
 * @param {string} props.message текст вопроса
 * @param {string} [props.confirmText] подпись кнопки подтверждения
 * @param {() => void} props.onClose
 * @param {() => void} props.onConfirm
 */
const ConfirmModal = ({
  open,
  title,
  message,
  confirmText = 'Подтвердить',
  onClose,
  onConfirm,
}) => {
  // Закрытие по Escape.
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
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
          <div className={styles.text}>{message}</div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.confirmBtn}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;