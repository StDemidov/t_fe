import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { subDays, addDays, format, getMonth, getYear } from 'date-fns'; // Для работы с датами
import ru from 'date-fns/locale/ru';
import { useDispatch, useSelector } from 'react-redux';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';

import 'react-datepicker/dist/react-datepicker.css';
import styles from './style.module.css';

const DatesFilter = ({ datesRange, setDatesRange, maxDate, minDate }) => {
  const [newDatesRange, setNewDatesRange] = useState([null, null]);

  useEffect(() => {
    if (datesRange.startDate && datesRange.endDate) {
      setNewDatesRange([datesRange.startDate, datesRange.endDate]);
    }
  }, [datesRange.startDate, datesRange.endDate]);

  console.log(datesRange);
  console.log(maxDate);

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

    const monthIndex = getMonth(date);
    const year = getYear(date);

    return `${months[monthIndex]} ${year}`;
  };

  const renderCustomHeader = ({ date, decreaseMonth, increaseMonth }) => {
    return (
      <div>
        <div className={styles.monthHeader}>
          <button className={styles.monthButton} onClick={decreaseMonth}>
            <IoIosArrowBack />
          </button>
          <span className={styles.month}>
            {date ? getMonthInNominative(date) : ''}
          </span>
          <button className={styles.monthButton} onClick={increaseMonth}>
            <IoIosArrowForward />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.calendar}>
      {/* Календарь с выбором диапазона */}
      <DatePicker
        className={styles.datePicker}
        selectsRange
        inline
        startDate={newDatesRange[0]}
        endDate={newDatesRange[1]}
        onChange={(update) => setNewDatesRange(update)}
        isClearable={false} // Позволяет очистить выбор
        placeholderText="Выберите диапазон"
        dateFormat="dd/MM/yyyy"
        maxDate={maxDate}
        minDate={minDate}
        renderCustomHeader={renderCustomHeader}
        locale={ru}
        onKeyDown={(e) => {
          e.preventDefault();
        }}
      />
      <button
        className={styles.buttonAccept}
        onClick={() => {
          setDatesRange({
            startDate: newDatesRange[0],
            endDate: newDatesRange[1],
          });
        }}
      >
        Применить
      </button>

      {/* Отображение выбранного диапазона */}
    </div>
  );
};

export default DatesFilter;
