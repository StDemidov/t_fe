import { FiSettings, FiExternalLink } from 'react-icons/fi';
import { PiPause, PiPlay, PiSkipForward } from 'react-icons/pi';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import styles from './PromoTable.module.css';

/**
 * Ячейка колонки «Действия»: кнопки управления кампанией.
 *
 * Кнопки, меняющие статус (пауза / запуск / завершение), удаление и
 * настройки видны только пользователям с правами (canManage). Переход
 * на детализированную страницу РК доступен всем.
 *
 * Каждый колбэк может быть null — тогда соответствующая кнопка не рисуется.
 * Доступность кнопок по статусу кампании определяет родитель (PromoTable).
 *
 * @param {object} props
 * @param {boolean} [props.canManage] права на управление кампаниями
 * @param {() => void} [props.onPause] поставить на паузу
 * @param {() => void} [props.onResume] запустить
 * @param {() => void} [props.onFinish] завершить
 * @param {() => void} [props.onDelete] удалить
 * @param {() => void} [props.onSettings] открыть настройки
 * @param {() => void} [props.onOpen] перейти на страницу РК
 */
const ActionsCell = ({
  canManage = false,
  onPause,
  onResume,
  onFinish,
  onDelete,
  onSettings,
  onOpen,
}) => {
  const showPause = canManage && onPause;
  const showResume = canManage && onResume;
  const showFinish = canManage && onFinish;
  const showDelete = canManage && onDelete;
  const showSettings = canManage && onSettings;
  const showOpen = Boolean(onOpen);

  // Если ни одно действие недоступно — показываем подсказку.
  if (
    !showPause &&
    !showResume &&
    !showFinish &&
    !showDelete &&
    !showSettings &&
    !showOpen
  ) {
    return (
      <div className={styles.actions}>
        <span className={styles.noActions}>Нет доступных действий</span>
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      {showPause && (
        <button
          type="button"
          className={styles.actionBtn}
          title="Поставить на паузу"
          aria-label="Поставить на паузу"
          onClick={(e) => {
            e.stopPropagation();
            onPause();
          }}
        >
          <PiPause />
        </button>
      )}
      {showResume && (
        <button
          type="button"
          className={styles.actionBtn}
          title="Запустить"
          aria-label="Запустить"
          onClick={(e) => {
            e.stopPropagation();
            onResume();
          }}
        >
          <PiPlay />
        </button>
      )}
      {showFinish && (
        <button
          type="button"
          className={styles.actionBtn}
          title="Завершить"
          aria-label="Завершить"
          onClick={(e) => {
            e.stopPropagation();
            onFinish();
          }}
        >
          <PiSkipForward />
        </button>
      )}
      {showDelete && (
        <button
          type="button"
          className={styles.actionBtnDanger}
          title="Удалить"
          aria-label="Удалить"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <RiDeleteBin2Fill />
        </button>
      )}
      {showSettings && (
        <button
          type="button"
          className={styles.actionBtn}
          title="Настройки"
          aria-label="Настройки"
          onClick={(e) => {
            e.stopPropagation();
            onSettings();
          }}
        >
          <FiSettings />
        </button>
      )}
      {showOpen && (
        <button
          type="button"
          className={styles.actionBtn}
          title="Перейти к кампании"
          aria-label="Перейти к кампании"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          <FiExternalLink />
        </button>
      )}
    </div>
  );
};

export default ActionsCell;
