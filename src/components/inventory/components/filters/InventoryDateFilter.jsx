import React, { useState, useRef, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import { subDays, addDays, format } from 'date-fns';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';
import ru from 'date-fns/locale/ru';
import { useDispatch, useSelector } from 'react-redux';
import { setInventoryDateRange, selectInventoryDateRange } from '../../redux/inventoryFilterSlice';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './InventoryDateFilter.module.css';
import filterStyles from './filters.module.css';

// Nominative case month names (react-datepicker uses genitive by default)
const MONTHS_NOM = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь',
];

const InventoryDateFilter = () => {
  const dispatch = useDispatch();
  const saved = useSelector(selectInventoryDateRange);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [range, setRange] = useState([new Date(saved.start), new Date(saved.end)]);
  const [startDate, endDate] = range;
  const [menuStyle, setMenuStyle] = useState({});
  const btnRef = useRef(null);
  const wrapRef = useRef(null);

  const computePos = useCallback(() => {
    if (!btnRef.current) return {};
    const r = btnRef.current.getBoundingClientRect();
    return { top: r.bottom + 5, left: r.left };
  }, []);

  const openCalendar = () => {
    setMenuStyle(computePos());
    setCalendarOpen(true);
  };

  // Recompute on scroll/resize
  useEffect(() => {
    if (!calendarOpen) return;
    const update = () => setMenuStyle(computePos());
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [calendarOpen, computePos]);

  useEffect(() => {
    if (!calendarOpen) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [calendarOpen]);

  const quickSet = (days) => {
    const s = subDays(new Date(), days);
    setRange([s, addDays(s, days - 1)]);
  };

  const handleCommit = () => {
    if (startDate && endDate && startDate < endDate) {
      dispatch(setInventoryDateRange({
        start: format(startDate, 'MM-dd-yyyy'),
        end: format(endDate, 'MM-dd-yyyy'),
      }));
      setCalendarOpen(false);
    }
  };

  const label = startDate && endDate
    ? `${format(startDate, 'dd.MM.yy')} – ${format(endDate, 'dd.MM.yy')}`
    : 'Период';

  // Custom header matching FlexCalendar style
  const renderHeader = ({ date, decreaseMonth, increaseMonth }) => (
    <>
      {/* Quick buttons above the month nav */}
      <div className={styles.quickBtns}>
        <button type="button" className={styles.quickBtn} onClick={() => quickSet(7)}>Неделя</button>
        <button type="button" className={styles.quickBtn} onClick={() => quickSet(14)}>2 нед.</button>
        <button type="button" className={styles.quickBtn} onClick={() => quickSet(30)}>Месяц</button>
      </div>
      <div className={styles.monthNav}>
        <button type="button" className={styles.navBtn} onClick={decreaseMonth}>
          <IoIosArrowBack size={12} />
        </button>
        <span className={styles.monthLabel}>
          {MONTHS_NOM[date.getMonth()]} {date.getFullYear()}
        </span>
        <button type="button" className={styles.navBtn} onClick={increaseMonth}>
          <IoIosArrowForward size={12} />
        </button>
      </div>
    </>
  );

  const canApply = startDate && endDate && startDate < endDate;

  return (
    <div className={styles.wrapper}>
      <button
        ref={btnRef}
        type="button"
        className={`${filterStyles.toggleBtn} ${calendarOpen ? filterStyles.toggleBtnActive : ''}`}
        onClick={() => calendarOpen ? setCalendarOpen(false) : openCalendar()}
      >
        {label}
        <span className={`${filterStyles.chevron} ${calendarOpen ? filterStyles.chevronOpen : ''}`}>▼</span>
      </button>

      {calendarOpen && (
        <div ref={wrapRef} className={styles.calendarWrap} style={menuStyle}>
          <DatePicker
            inline
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(u) => setRange(u)}
            isClearable={false}
            maxDate={subDays(new Date(), 1)}
            minDate={new Date('2024-07-01')}
            renderCustomHeader={renderHeader}
            locale={ru}
            onKeyDown={(e) => e.preventDefault()}
            shouldCloseOnSelect={false}
          />
          <div className={styles.commitRow}>
            <button
              type="button"
              className={styles.commitBtn}
              onClick={handleCommit}
              disabled={!canApply}
            >
              Принять
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDateFilter;
