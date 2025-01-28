import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setAutoCmpgStatus,
  resetAutoCmpgStatus,
  selectAutoCampStatusFilter,
} from '../../../redux/slices/filterSlice';

import styles from './style.module.css';

const CMPGN_STATUS = {
  '-1': 'Кампания в процессе удаления',
  4: 'Готова к запуску',
  7: 'Кампания завершена',
  8: 'Отказался',
  9: 'Идут показы',
  11: 'Кампания на паузе',
};

const ACStatusFilter = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(
    useSelector(selectAutoCampStatusFilter)
  );
  const dispatch = useDispatch();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleFilterApply = () => {
    toggleDropdown();
    dispatch(setAutoCmpgStatus(selectedOptions));
  };

  const handleFilterReset = () => {
    setSelectedOptions([]);
    dispatch(resetAutoCmpgStatus);
  };

  const handleOptionChange = (event) => {
    const { value, checked } = event.target;
    let newSelectedOptions = [...selectedOptions];

    if (checked) {
      newSelectedOptions.push(Number(value));
    } else {
      newSelectedOptions = newSelectedOptions.filter(
        (option) => option !== Number(value)
      );
    }
    setSelectedOptions(newSelectedOptions);
  };

  return (
    <div className={styles.dropdown}>
      <button
        className={`${styles.dropdownToggle} ${isOpen ? styles.open : ''}`}
        onClick={toggleDropdown}
      >
        Статус
        <span className={styles.arrow}>{isOpen ? '✕' : '▼'}</span>
      </button>
      {isOpen && (
        <div className={`${styles.dropdownMenu} ${isOpen ? styles.show : ''}`}>
          {options.map((option, index) => (
            <label key={index} className={styles.dropdownItem}>
              <input
                type="checkbox"
                value={option}
                checked={selectedOptions.includes(Number(option))}
                onChange={handleOptionChange}
              />

              <span className={styles.customCheckbox}></span>
              {CMPGN_STATUS[option]}
            </label>
          ))}
          <div className={styles.drowdownActions}>
            <button
              className={styles.dropdownReset}
              onClick={handleFilterReset}
              style={{ display: selectedOptions.length ? 'block' : 'none' }}
            >
              Сбросить
            </button>

            <button
              className={styles.dropdownClose}
              onClick={handleFilterApply}
            >
              Применить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ACStatusFilter;
