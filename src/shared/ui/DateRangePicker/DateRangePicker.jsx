import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import styles from './DateRangePicker.module.css';

/** Дни недели с понедельника. */
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const toDate = (str) => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addMonths = (date, delta) =>
  new Date(date.getFullYear(), date.getMonth() + delta, 1);

const isInRange = (date, start, end) =>
  !!start && !!end && date >= start && date <= end;

const fmtForButton = (value) =>
  value ? value.split('-').reverse().join('.') : '';

/**
 * Применяет ограничения min/max к дате; возвращает null, если вне границ.
 */
const clampDate = (dateStr, minDate, maxDate) => {
  if (!dateStr) return null;
  if (minDate && dateStr < minDate) return null;
  if (maxDate && dateStr > maxDate) return null;
  return dateStr;
};

/**
 * Календарь выбора дат (как выпадающий фильтр).
 *
 * По умолчанию закрыт; раскрывается по клику. Позволяет выбрать диапазон дат
 * (первый клик — начало, второй — конец) либо одну дату (клик по уже
 * выбранной точке). При одной дате startDate === endDate.
 *
 * Выбранные даты накапливаются во внутреннем «чертеже» (draft) и применяются
 * только по кнопке «Применить» — тогда вызывается onChange и календарь
 * закрывается. Кнопка «Закрыть» просто сворачивает календарь без применения.
 *
 * Выпадашка рендерится в портал и позиционируется по кнопке — чтобы её не
 * обрезал контейнер фильтров с overflow.
 *
 * @param {object} props
 * @param {{ startDate: string, endDate: string }} props.value — даты YYYY-mm-dd
 * @param {(range: { startDate: string, endDate: string }) => void} props.onChange
 * @param {string} [props.minDate] — минимально допустимая дата YYYY-mm-dd
 * @param {string} [props.maxDate] — максимально допустимая дата YYYY-mm-dd
 * @param {boolean} [props.disabled=false]
 */
const DateRangePicker = ({
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
}) => {
  const { startDate: initialStart = '', endDate: initialEnd = '' } = value || {};
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(initialStart);
  const [draftEnd, setDraftEnd] = useState(initialEnd);
  const [pickingStart, setPickingStart] = useState(true);
  const [viewMonth, setViewMonth] = useState(
    () => toDate(initialEnd || initialStart) || new Date()
  );
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    setDraftStart(initialStart);
    setDraftEnd(initialEnd);
  }, [initialStart, initialEnd]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const handleScroll = () => setOpen(false);
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  const toggle = () => {
    if (disabled) return;
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen((o) => !o);
  };

  const handleSelect = (dateStr) => {
    if (clampDate(dateStr, minDate, maxDate) === null) return;

    // Если диапазон уже готов — этот клик начинает новый выбор.
    const myPickingStart = Boolean(draftStart && draftEnd) ? true : pickingStart;

    // Выбор одной даты: клик по уже выбранной точке.
    const isPoint = draftStart === dateStr && draftEnd === dateStr;
    if (isPoint && !myPickingStart) {
      setDraftEnd(dateStr);
      return;
    }

    if (myPickingStart) {
      setDraftStart(dateStr);
      setDraftEnd('');
      setPickingStart(false);
    } else {
      // Кликнули раньше начала — новый диапазон.
      if (dateStr < draftStart) {
        setDraftStart(dateStr);
        setDraftEnd('');
      } else {
        setDraftEnd(dateStr);
      }
    }
  };

  const apply = (start, end) => {
    setPickingStart(true);
    onChange?.({ startDate: start, endDate: end });
    setOpen(false);
  };

  const handleApply = () => {
    apply(draftStart, draftEnd);
  };

  const handleClose = () => {
    setPickingStart(true);
    setOpen(false);
  };

  const monthDays = buildMonthCells(viewMonth);

  const popover = open ? (
    createPortal(
      <div
        ref={popoverRef}
        className={styles.popover}
        style={{ top: pos.top, left: pos.left }}
      >
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
          >
            <FaChevronLeft />
          </button>
          <span className={styles.monthLabel}>
            {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </span>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
          >
            <FaChevronRight />
          </button>
        </div>

        <div className={styles.gridHeader}>
          {WEEKDAYS.map((d) => (
            <span key={d} className={styles.weekday}>{d}</span>
          ))}
        </div>

        <div className={styles.grid}>
          {monthDays.map((cell, i) => {
            const { dateStr, inMonth } = cell;
            if (!dateStr) {
              return <span key={`empty-${i}`} className={styles.empty} />;
            }
            const disabledDay = clampDate(dateStr, minDate, maxDate) === null;
            const date = toDate(dateStr);
            const isStart = draftStart && dateStr === draftStart;
            const isEnd = draftEnd && dateStr === draftEnd;
            const inRange = isInRange(
              date,
              draftStart ? toDate(draftStart) : null,
              draftEnd ? toDate(draftEnd) : null
            );
            return (
              <button
                key={dateStr}
                type="button"
                disabled={disabledDay}
                className={[
                  styles.day,
                  inMonth ? '' : styles.outside,
                  disabledDay ? styles.disabled : '',
                  isStart ? styles.start : '',
                  isEnd ? styles.end : '',
                  isStart && isEnd ? styles.point : '',
                  inRange && !isStart && !isEnd ? styles.inRange : '',
                ].join(' ')}
                onClick={() => handleSelect(dateStr)}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
          >
            Закрыть
          </button>
          <button
            type="button"
            className={styles.applyButton}
            onClick={handleApply}
            disabled={!draftStart}
          >
            Применить
          </button>
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <div className={styles.root}>
      <button
        type="button"
        ref={triggerRef}
        className={styles.trigger}
        onClick={toggle}
        disabled={disabled}
      >
        <svg className={styles.calendarIcon} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className={styles.triggerText}>
          {initialStart && initialEnd
            ? initialStart === initialEnd
              ? fmtForButton(initialEnd)
              : `${fmtForButton(initialStart)} — ${fmtForButton(initialEnd)}`
            : 'Выбрать даты'}
        </span>
      </button>

      {popover}
    </div>
  );
};

/**
 * Возвращает массив ячеек месяца для сетки календаря. Пустые строки —
 * заполнители до начала месяца.
 */
const buildMonthCells = (month) => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();
  // Смещение начала месяца в сетке (неделя начинается с понедельника).
  const offset = (first.getDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push({ dateStr: null, inMonth: false });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      dateStr: formatDate(new Date(month.getFullYear(), month.getMonth(), d)),
      inMonth: true,
    });
  }
  return cells;
};

export default DateRangePicker;
