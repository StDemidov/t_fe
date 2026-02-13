import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import ru from 'date-fns/locale/ru';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';
import { FiCalendar } from 'react-icons/fi';

import 'react-datepicker/dist/react-datepicker.css';
import styles from './style.module.css';

const DatesFilter = ({ datesRange, setDatesRange, maxDate }) => {
  const [newDatesRange, setNewDatesRange] = useState([null, null]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const containerRef = useRef(null);
  const calendarRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 250 });
  useEffect(() => {
    if (datesRange.startDate && datesRange.endDate) {
      setNewDatesRange([datesRange.startDate, datesRange.endDate]);
    }
  }, [datesRange.startDate, datesRange.endDate]);
  // Функция для вычисления позиции календаря
  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  const handleOpenCalendar = () => {
    updatePosition();
    setCalendarOpen(!calendarOpen);
  };

  const handleApply = () => {
    setDatesRange({
      startDate: newDatesRange[0],
      endDate: newDatesRange[1],
      maxDate: maxDate,
    });
    setCalendarOpen(false);
  };

  // Обработка клика вне календаря
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Проверяем, кликнули ли мы вне контейнера и календаря
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target)
      ) {
        setCalendarOpen(false);
      }
    };

    if (calendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Обновляем позицию при изменении размеров окна
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [calendarOpen]);

  // Функции getMonthInNominative и formatDateRange остаются без изменений
  const getMonthInNominative = (date) => {
    const months = [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь',
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatDateRange = () => {
    if (datesRange.startDate && datesRange.endDate) {
      return `${format(datesRange.startDate, 'dd.MM.yyyy')} - ${format(
        datesRange.endDate,
        'dd.MM.yyyy'
      )}`;
    }
    return 'Выберите диапазон';
  };

  const renderCustomHeader = ({ date, decreaseMonth, increaseMonth }) => (
    <div className={styles.monthHeader}>
      <button
        type="button"
        className={styles.monthButton}
        onClick={decreaseMonth}
      >
        <IoIosArrowBack />
      </button>
      <span className={styles.month}>
        {date ? getMonthInNominative(date) : ''}
      </span>
      <button
        type="button"
        className={styles.monthButton}
        onClick={increaseMonth}
      >
        <IoIosArrowForward />
      </button>
    </div>
  );

  // Компонент календаря, рендеримый через портал
  const CalendarPortal = () => {
    if (!calendarOpen) return null;

    return ReactDOM.createPortal(
      <div
        ref={calendarRef}
        className={styles.calendar}
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          zIndex: 9999,
        }}
      >
        <DatePicker
          selectsRange
          inline
          startDate={newDatesRange[0]}
          endDate={newDatesRange[1]}
          onChange={(update) => setNewDatesRange(update)}
          isClearable={false}
          dateFormat="dd/MM/yyyy"
          maxDate={maxDate}
          renderCustomHeader={renderCustomHeader}
          locale={ru}
          onKeyDown={(e) => e.preventDefault()}
          shouldCloseOnSelect={false}
        >
          <div className={styles.calendarFooter}>
            <button
              type="button"
              className={styles.buttonCancel}
              onClick={() => setCalendarOpen(false)}
            >
              Отмена
            </button>
            <button
              type="button"
              className={styles.buttonAccept}
              onClick={handleApply}
            >
              Применить
            </button>
          </div>
        </DatePicker>
      </div>,
      document.body
    );
  };

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Кнопка-триггер */}
      <button
        type="button"
        className={styles.triggerButton}
        onClick={handleOpenCalendar}
      >
        <FiCalendar className={styles.calendarIcon} />
        <span className={styles.dateText}>{formatDateRange()}</span>
        <span className={styles.arrowIcon}>{calendarOpen ? '▲' : '▼'}</span>
      </button>

      {/* Календарь через портал */}
      <CalendarPortal />
    </div>
  );
};

export default DatesFilter;
