import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { subDays, addDays, format } from 'date-fns'; // Для работы с датами
import ru from 'date-fns/locale/ru';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectSingleVCDatesFilter,
  setSingleVCDatesFilter,
} from '../../../redux/slices/filterSlice';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './style.module.css';
import { setError } from '../../../redux/slices/errorSlice';

const SingleVCDateFilter = () => {
  const dates = useSelector(selectSingleVCDatesFilter);
  const [dateRange, setDateRange] = useState([dates.start, dates.end]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [startDate, endDate] = dateRange;

  const dispatch = useDispatch();

  // Функции для установки фиксированных периодов
  const setWeekRange = () => {
    const today = new Date();
    const start = subDays(today, 7);
    const end = addDays(start, 6);
    setDateRange([start, end]);
  };

  const setTwoWeeksRange = () => {
    const today = new Date();
    const start = subDays(today, 14);
    const end = addDays(start, 13);
    setDateRange([start, end]);
  };

  const setMonthRange = () => {
    const today = new Date();
    const start = subDays(today, 30);
    const end = addDays(start, 29);
    setDateRange([start, end]);
  };

  const handleCommitDates = () => {
    if (startDate < endDate) {
      dispatch(
        setSingleVCDatesFilter({
          start: format(startDate, 'MM-dd-yyyy'),
          end: format(endDate, 'MM-dd-yyyy'),
        })
      );
      setCalendarOpen(false);
    } else {
      dispatch(setError('Дата окончания должна быть больше даты начала!'));
    }
  };

  const renderCustomHeader = ({ date, decreaseMonth, increaseMonth }) => {
    return (
      <div>
        <div className={styles.periodsBlock}>
          <button className={styles.periodButton} onClick={setWeekRange}>
            Неделя
          </button>
          <button className={styles.periodButton} onClick={setTwoWeeksRange}>
            Две недели
          </button>
          <button className={styles.periodButton} onClick={setMonthRange}>
            Месяц
          </button>
        </div>
        <div className={styles.monthHeader}>
          <button className={styles.monthButton} onClick={decreaseMonth}>
            {'<'}
          </button>
          <span className={styles.month}>
            {date ? format(date, 'MMMM yyyy', { locale: ru }) : ''}
          </span>
          <button className={styles.monthButton} onClick={increaseMonth}>
            {'>'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Календарь с выбором диапазона */}
      <DatePicker
        className={styles.datePicker}
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onClick={() => setCalendarOpen(true)}
        onChange={(update) => {
          setDateRange(update);
          setCalendarOpen(true);
        }}
        open={calendarOpen}
        isClearable={false} // Позволяет очистить выбор
        placeholderText="Выберите диапазон"
        dateFormat="dd/MM/yyyy"
        maxDate={subDays(new Date(), 1)}
        minDate={Date.parse('01 Jul 2024 00:00:00 GMT')}
        renderCustomHeader={renderCustomHeader}
        onFocus={() => setCalendarOpen(true)}
        onClickOutside={() => setCalendarOpen(false)}
        locale={ru}
        onKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <div className={styles.acceptDiv}>
          <button className={styles.buttonAccept} onClick={handleCommitDates}>
            Принять
          </button>
        </div>
      </DatePicker>

      <style jsx={true.toString()}>{`
        .react-datepicker {
          font-family: 'Sofia Sans Condensed', sans-serif;
          text-transform: uppercase;
          box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3); /* Легкая черная тень */
        }
        .react-datepicker__tab-loop {
          position: relative;
          z-index: 1000;
        }
        .react-datepicker__day--selected {
          background-color: #8254dd; /* Цвет выбранного дня */
          color: white; /* Цвет текста для выбранного дня */
        }
        .react-datepicker__day--in-range {
          background-color: #8254ff; /* Цвет для дней в диапазоне */
          color: white; /* Цвет текста для дней в диапазоне */
        }
        .react-datepicker__day--in-range:before {
          background-color: #8254ff; /* Цвет для границ диапазона */
        }
      `}</style>

      {/* Отображение выбранного диапазона */}
    </div>
  );
};

export default SingleVCDateFilter;
