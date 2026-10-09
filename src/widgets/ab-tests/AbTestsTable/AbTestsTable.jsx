import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdOutlineImageNotSupported } from 'react-icons/md';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { IoStatsChart } from 'react-icons/io5';
import { PiPause, PiPlay, PiSkipForward } from 'react-icons/pi';
import { selectUser } from '../../../redux/slices/authSlice';
import {
  deleteAbTest,
  pauseAbTest,
  startAbTest,
  finishAbTest,
} from '../../../entities/ab-tests';
import { AbTestStatsModal, ConfirmModal } from '../../../shared/ui';
import { getAbTestStatus, isActiveDeletable, isPendingDeletable } from '../lib/abTestStatuses';
import CopyBadge from './CopyBadge';
import ArticleCell from './ArticleCell';
import styles from './AbTestsTable.module.css';

/** Сколько строк рисуем в скелетоне, пока грузится раздел. */
const SKELETON_ROWS = 8;

/** Статусы активных тестов, у которых есть кнопка паузы. */
const PAUSABLE_STATUSES = new Set([9, 29]);
/** Статусы активных тестов, у которых есть кнопка запуска. */
const RESUMABLE_STATUSES = new Set([11, 211]);
/** Статусы активных тестов, у которых есть кнопка завершения. */
const FINISHABLE_STATUSES = new Set([9, 11, 29, 211, 45]);

/**
 * Колонки разделов. Ключ колонки используется и в шапке, и в теле строки,
 * поэтому скелетон всегда совпадает с реальной таблицей по числу колонок.
 */
const COLUMNS = {
  finished: [
    { key: 'winner', label: 'Фото-победитель', photo: true },
    { key: 'article', label: 'Артикул' },
    { key: 'adId', label: 'ID РК', badge: true },
    { key: 'cpm', label: 'CPM' },
    { key: 'goal', label: 'Цель, просм.' },
    { key: 'start', label: 'Старт' },
    { key: 'end', label: 'Окончание' },
    { key: 'actions', label: '' },
  ],
  // «Активные»: колонки как у «В обработке», только без «Окончания».
  // Фото артикула — снимок, который сейчас тестируется (isCurrentlyTesting),
  // поверх него — анимация «идёт тест».
  active: [
    { key: 'articlePhoto', label: 'Фото артикула', photo: true },
    { key: 'article', label: 'Артикул' },
    { key: 'status', label: 'Статус', status: true },
    { key: 'cpm', label: 'CPM' },
    { key: 'goal', label: 'Цель, просм.' },
    { key: 'start', label: 'Старт' },
    { key: 'actions', label: '' },
  ],
  // «В обработке»: фото артикула и статус этапа. Удаление доступно
  // на активных этапах подготовки — после ответа 200 статус меняется на 213.
  pending: [
    { key: 'articlePhoto', label: 'Фото артикула', photo: true },
    { key: 'article', label: 'Артикул' },
    { key: 'status', label: 'Статус', status: true },
    { key: 'cpm', label: 'CPM' },
    { key: 'goal', label: 'Цель, просм.' },
    { key: 'start', label: 'Старт' },
    { key: 'end', label: 'Окончание' },
    { key: 'actions', label: '' },
  ],
};

/** Класс ячейки по ключу колонки. */
const cellClass = (key) => styles[`col${key.charAt(0).toUpperCase()}${key.slice(1)}`];

/** Дата в формате DD.MM.YYYY HH:mm; пустая строка, если значения нет. */
const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/**
 * CTR в процентах: clicks / views * 100, округление до 2 знаков.
 * @returns {string} '—', если views не положительное число
 */
const formatCtr = (photo) => {
  const views = Number(photo.views);
  const clicks = Number(photo.clicks);
  if (!Number.isFinite(views) || views <= 0 || !Number.isFinite(clicks))
    return '—';
  return `${((clicks / views) * 100).toFixed(2)} %`;
};

/** Число с разделителями или прочерк. */
const formatNumber = (value) =>
  value != null ? value.toLocaleString() : null;

/**
 * Плашка статуса теста. Цвет зависит от тона: идёт процесс, ошибка,
 * успех или ожидание.
 */
const StatusCell = ({ status }) => {
  const meta = getAbTestStatus(status);
  if (!meta) return <span className={styles.dash}>—</span>;
  return (
    <span
      className={`${styles.statusBadge} ${styles[`statusTone${meta.tone.charAt(0).toUpperCase()}${meta.tone.slice(1)}`]}`}
    >
      {meta.label}
    </span>
  );
};

/**
 * Фотография теста. Подпись под ней зависит от колонки: CTR у победителя,
 * просмотры/клики — в общем списке фотографий, у «фото артикула» подписи нет.
 * Фото, которое сейчас тестируется, помечается анимацией поверх.
 */
const PhotoCell = ({ photo, showViews, showCtr, animate }) => {
  const classNames = [styles.photo];
  if (photo.isCurrentlyTesting) classNames.push(styles.photoTesting);
  if (photo.isWinner) classNames.push(styles.photoWinner);

  return (
    <div className={styles.photoWrap}>
      <div className={classNames.join(' ')}>
        {photo.photo ? (
          <img
            className={styles.photoImg}
            src={photo.photo}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.visibility = 'hidden';
            }}
          />
        ) : (
          <MdOutlineImageNotSupported className={styles.photoIcon} />
        )}
        {animate && <span className={styles.testingPulse} />}
      </div>
      {showViews && (
        <div className={styles.photoMeta}>
          {showCtr ? (
            <span className={styles.ctr}>CTR {formatCtr(photo)}</span>
          ) : (
            <span className={styles.photoStats}>
              {photo.views ?? 0} / {photo.clicks ?? 0}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Кнопки действий в последней колонке.
 *
 * «Завершенные»: статистика и удаление.
 * «Активные»: статистика, пауза/запуск/завершение (по текущему статусу)
 * и удаление. Управляющие кнопки видны только при праве `ab_tests_manage`.
 * «В обработке»: только удаление, и то не у всех статусов.
 */
const ActionsCell = ({
  canManage,
  canDelete,
  onShowStats,
  onPause,
  onResume,
  onFinish,
  onDelete,
}) => (
  <div className={styles.actions}>
    {onShowStats && (
      <button
        type="button"
        className={styles.actionBtn}
        title="Статистика теста"
        aria-label="Статистика теста"
        onClick={onShowStats}
      >
        <IoStatsChart />
      </button>
    )}
    {canManage && onPause && (
      <button
        type="button"
        className={styles.actionBtn}
        title="Поставить на паузу"
        aria-label="Поставить на паузу"
        onClick={onPause}
      >
        <PiPause />
      </button>
    )}
    {canManage && onResume && (
      <button
        type="button"
        className={styles.actionBtn}
        title="Запустить тест"
        aria-label="Запустить тест"
        onClick={onResume}
      >
        <PiPlay />
      </button>
    )}
    {canManage && onFinish && (
      <button
        type="button"
        className={styles.actionBtn}
        title="Завершить тест"
        aria-label="Завершить тест"
        onClick={onFinish}
      >
        <PiSkipForward />
      </button>
    )}
    {canManage && canDelete && (
      <button
        type="button"
        className={styles.actionBtnDanger}
        title="Удалить тест"
        aria-label="Удалить тест"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <RiDeleteBin2Fill />
      </button>
    )}
  </div>
);

/** Фото с isCurrentlyTesting, иначе первое из массива (или пустой объект). */
const testingPhotoOf = (test) =>
  test.photos.find((p) => p.isCurrentlyTesting) || test.photos[0] || {};

/**
 * Действие над активным тестом (пауза/запуск/завершение): обёртка над thunk,
 * которая после ответа «оживляет» тост. Ошибка уже записана в state,
 * здесь только красивое сообщение поверх.
 *
 * @param {{ id: string|number }} arg id (и метаданные) для thunk
 */
const runAction = async (dispatch, thunk, arg, successText) => {
  try {
    await dispatch(thunk(arg)).unwrap();
    return { kind: 'success', text: successText };
  } catch {
    return { kind: 'error', text: 'Ошибка выполнения действия' };
  }
};

/** Значение ячейки по ключу колонки. */
const renderCell = ({ key }, test, ctx) => {
  switch (key) {
    case 'winner':
      return test.photos.some((p) => p.isWinner) ? (
        <div className={styles.photos}>
          {test.photos
            .filter((p) => p.isWinner)
            .map((photoItem, i) => (
              <PhotoCell
                key={`${test.id}-winner-${i}`}
                photo={photoItem}
                showViews
                showCtr
              />
            ))}
        </div>
      ) : (
        <span className={styles.dash}>—</span>
      );

    // Фото артикула: в «В обработке» — одна фотка из поля photo,
    // в «Активных» — снимок, который сейчас проверяется (с анимацией).
    case 'articlePhoto':
      if (ctx.status === 'active') {
        const photo = testingPhotoOf(test);
        return photo.photo ? (
          <div className={styles.photos}>
            <PhotoCell photo={photo} animate={Boolean(photo.isCurrentlyTesting)} />
          </div>
        ) : (
          <span className={styles.dash}>—</span>
        );
      }
      return test.photo ? (
        <div className={styles.photos}>
          <PhotoCell photo={{ photo: test.photo }} />
        </div>
      ) : (
        <span className={styles.dash}>—</span>
      );

    case 'status':
      return <StatusCell status={test.status} />;

    // Колонка «Фотографии» осталась только в завершённых историях.
    case 'photos':
      return test.photos.length ? (
        <div className={styles.photos}>
          {test.photos.map((photoItem, i) => (
            <PhotoCell
              key={`${test.id}-photo-${i}`}
              photo={photoItem}
              showViews
            />
          ))}
        </div>
      ) : (
        <span className={styles.dash}>—</span>
      );

    case 'article':
      return <ArticleCell vendorCode={test.vendorCode} sku={test.sku} />;

    case 'adId':
      return <CopyBadge value={test.abTestAdId} title="Скопировать ID РК" />;

    case 'cpm':
      return formatNumber(test.cpm) ?? <span className={styles.dash}>—</span>;

    case 'goal':
      return (
        formatNumber(test.viewsGoal) ?? <span className={styles.dash}>—</span>
      );

    case 'start':
      return test.startDatetime ? (
        formatDateTime(test.startDatetime)
      ) : (
        <span className={styles.dash}>—</span>
      );

    case 'end':
      return test.endDatetime ? (
        formatDateTime(test.endDatetime)
      ) : (
        <span className={styles.dash}>—</span>
      );

    case 'actions':
      return (
        <ActionsCell
          canManage={ctx.canManage}
          canDelete={ctx.canDelete}
          onShowStats={ctx.onShowStats}
          onPause={ctx.onPause}
          onResume={ctx.onResume}
          onFinish={ctx.onFinish}
          onDelete={ctx.onDelete}
        />
      );

    default:
      return null;
  }
};

/** Конфиги окна подтверждения: удаление / пауза / запуск / завершение. */
const CONFIRM_CONF = {
  delete: {
    title: 'Удаление A/B теста',
    message: 'Вы уверены, что хотите удалить AB-тест?',
    confirmText: 'Удалить',
  },
  pause: {
    title: 'Пауза A/B теста',
    message: 'Вы уверены, что хотите поставить на паузу AB-тест?',
    confirmText: 'Пауза',
  },
  resume: {
    title: 'Запуск A/B теста',
    message: 'Вы уверены, что хотите запустить AB-тест?',
    confirmText: 'Запустить',
  },
  finish: {
    title: 'Завершение A/B теста',
    message: 'Вы уверены, что хотите завершить AB-тест?',
    confirmText: 'Завершить',
  },
};

/**
 * Таблица A/B тестов раздела.
 *
 * Раздел «Завершенные»:
 *   Фото-победитель | Артикул (vendorCode + плашка SKU) | ID РК | CPM |
 *   Цель, просм. | Старт | Окончание | действия
 * В колонке «Фото-победитель» — только фото с отметкой победителя,
 * под ним CTR в процентах (clicks / views * 100, 2 знака).
 *
 * Раздел «Активные»:
 *   Фото артикула | Артикул | Статус | CPM | Цель, просм. | Старт | действия
 * Фото — снимок с isCurrentlyTesting (над ним анимация «тест идёт»), статус —
 * плашка. В действиях: статистика, пауза (9/29), запуск (11/211),
 * завершение (9/11/29/211/45) и удаление — всё через окно подтверждения.
 *
 * Раздел «В обработке»:
 *   Фото артикула | Артикул | Статус | CPM | Цель, просм. | Старт | Окончание
 * Удаление доступно на активных этапах подготовки (0…4 и их ошибки) — после
 * подтверждения и ответа 200 статус теста меняется на 213.
 *
 * Пока идёт загрузка раздела, вместо текста рисуется скелетон с тем же
 * набором колонок, чтобы таблица не прыгала после появления данных.
 *
 * @param {object} props
 * @param {'active'|'finished'|'pending'} props.status раздел
 * @param {Array} props.items тесты раздела
 * @param {boolean} props.isLoading идёт ли загрузка
 */
const AbTestsTable = ({ status, items, isLoading }) => {
  const dispatch = useDispatch();
  const [statsTest, setStatsTest] = useState(null);
  // Открытое окно подтверждения: { kind, test } или null.
  const [confirmState, setConfirmState] = useState(null);
  // Toast поверх таблицы.
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const currentUser = useSelector(selectUser);
  const canManage =
    currentUser?.permissions?.ab_tests_manage ||
    currentUser?.permissions?.is_admin;

  const columns = COLUMNS[status] || COLUMNS.active;

  // Тост: выплывает, затем уползает сам.
  useEffect(() => {
    if (!toast) return undefined;
    const raf = requestAnimationFrame(() => setToastVisible(true));
    const hideTimer = setTimeout(() => setToastVisible(false), 2400);
    const clearTimer = setTimeout(() => {
      setToast(null);
      setToastVisible(false);
    }, 2900);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
    };
  }, [toast]);

  // Удаление доступно по статусу: у «В обработке» — активные этапы
  // подготовки, у «Активных» — статусы 9/11/211/29/45 (212 не удаляется).
  const canDeleteFor = (test) =>
    canManage &&
    (status === 'pending'
      ? isPendingDeletable(test.status)
      : status === 'active'
        ? isActiveDeletable(test.status)
        : true);

  /**
   * Пользователь подтвердил действие в окне. Запросы уходят только здесь;
   * закрытие окна или «Отмена» ничего не отправляют.
   */
  const runConfirmedAction = async () => {
    if (!confirmState) return;
    const { kind, test } = confirmState;
    setConfirmState(null);

    let toastResult = null;
    switch (kind) {
      case 'delete':
        toastResult = await runAction(
          dispatch,
          deleteAbTest,
          { id: test.id, status, test },
          'Тест удален'
        );
        break;
      case 'pause':
        toastResult = await runAction(
          dispatch,
          pauseAbTest,
          { id: test.id },
          'Тест на паузе'
        );
        break;
      case 'resume':
        toastResult = await runAction(
          dispatch,
          startAbTest,
          { id: test.id },
          'Тест запущен'
        );
        break;
      case 'finish':
        toastResult = await runAction(
          dispatch,
          finishAbTest,
          { id: test.id },
          'Тест завершен'
        );
        break;
      default:
        return;
    }
    setToast(toastResult);
  };

  const table = (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map(({ key, label }) => (
            <th key={key} className={cellClass(key)}>
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {isLoading
          ? Array.from({ length: SKELETON_ROWS }, (_, rowIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <tr key={`skeleton-${rowIndex}`} className={styles.skeletonRow}>
                {columns.map(({ key, badge, photo, status }) => (
                  <td key={key} className={cellClass(key)}>
                    {photo || status ? (
                      <div className={status ? styles.skeletonBadgeWide : styles.skeletonPhoto} />
                    ) : badge ? (
                      <div className={styles.skeletonBadge} />
                    ) : (
                      <div className={styles.skeletonLine} />
                    )}
                  </td>
                ))}
              </tr>
            ))
          : items.map((test) => (
              <tr key={test.id}>
                {columns.map((column) => (
                  <td key={column.key} className={cellClass(column.key)}>
                    {renderCell(column, test, {
                      status,
                      canManage,
                      canDelete: canDeleteFor(test),
                      // Статистика есть во всех разделах кроме «В обработке».
                      onShowStats:
                        status === 'pending' ? null : () => setStatsTest(test),
                      // Пауза/запуск/завершение — только у активных тестов,
                      // по текущему статусу.
                      onPause:
                        status === 'active' && PAUSABLE_STATUSES.has(test.status)
                          ? () =>
                              setConfirmState({ kind: 'pause', test })
                          : null,
                      onResume:
                        status === 'active' && RESUMABLE_STATUSES.has(test.status)
                          ? () =>
                              setConfirmState({ kind: 'resume', test })
                          : null,
                      onFinish:
                        status === 'active' && FINISHABLE_STATUSES.has(test.status)
                          ? () =>
                              setConfirmState({ kind: 'finish', test })
                          : null,
                      onDelete: () => setConfirmState({ kind: 'delete', test }),
                    })}
                  </td>
                ))}
              </tr>
            ))}
      </tbody>
    </table>
  );

  const confirmConf = confirmState ? CONFIRM_CONF[confirmState.kind] : null;

  if (!isLoading && !items.length) {
    return (
      <>
        <div className={styles.state}>Тестов нет</div>
        <AbTestStatsModal
          open={Boolean(statsTest)}
          test={statsTest}
          variant={status === 'active' ? 'active' : 'finished'}
          onClose={() => setStatsTest(null)}
        />
      </>
    );
  }

  return (
    <div className={styles.wrap}>
      {table}
      <AbTestStatsModal
        open={Boolean(statsTest)}
        test={statsTest}
        variant={status === 'active' ? 'active' : 'finished'}
        onClose={() => setStatsTest(null)}
      />
      {confirmState && (
        <ConfirmModal
          open
          title={confirmConf.title}
          message={confirmConf.message}
          confirmText={confirmConf.confirmText}
          onClose={() => setConfirmState(null)}
          onConfirm={runConfirmedAction}
        />
      )}
      {toast && (
        <div
          className={`${styles.toast} ${
            toast.kind === 'error' ? styles.toastError : styles.toastSuccess
          } ${toast.kind === 'error' ? styles.toastRight : styles.toastLeft} ${
            toastVisible ? styles.toastVisible : ''
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
};

export default AbTestsTable;