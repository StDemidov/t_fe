import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';
import ru from 'date-fns/locale/ru';

import 'react-datepicker/dist/react-datepicker.css';
import styles from './FlexCalendar.module.css';

const FlexCalendar = ({
  startDate = null,
  endDate = null,
  onDatesChange,
  maxDate = new Date(),
}) => {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    setLocalStart(startDate);
    setLocalEnd(endDate);
  }, [startDate, endDate]);

  const handleChange = ([start, end]) => {
    setLocalStart(start);
    setLocalEnd(end);
  };

  const handleApply = () => {
    if (!localStart || !localEnd) return;
    setIsApplying(true);
    setTimeout(() => setIsApplying(false), 280);
    onDatesChange?.({ startDate: localStart, endDate: localEnd });
  };

  const getMonthLabel = (date) => {
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

  const renderCustomHeader = ({ date, decreaseMonth, increaseMonth }) => (
    <div className={styles.header}>
      <button type="button" className={styles.navBtn} onClick={decreaseMonth}>
        <IoIosArrowBack size={12} />
      </button>
      <span className={styles.monthLabel}>{getMonthLabel(date)}</span>
      <button type="button" className={styles.navBtn} onClick={increaseMonth}>
        <IoIosArrowForward size={12} />
      </button>
    </div>
  );

  const canApply = localStart && localEnd;

  return (
    <div className={styles.root}>
      <DatePicker
        selectsRange
        inline
        startDate={localStart}
        endDate={localEnd}
        onChange={handleChange}
        maxDate={maxDate}
        locale={ru}
        renderCustomHeader={renderCustomHeader}
        shouldCloseOnSelect={false}
        fixedHeight /* ← ключевой проп: фиксирует высоту сетки */
        onKeyDown={(e) => e.preventDefault()}
      >
        <div className={styles.footer}>
          <button
            type="button"
            onClick={handleApply}
            disabled={!canApply}
            className={[
              styles.applyBtn,
              isApplying ? styles.applying : '',
              !canApply ? styles.disabled : '',
            ].join(' ')}
          >
            Применить
          </button>
        </div>
      </DatePicker>
    </div>
  );
};

export default FlexCalendar;
