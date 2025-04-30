import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setAutoCmpgHasActiveHours,
  resetAutoCmpgHasActiveHours,
  selectAutoCampHasActiveHoursFilter,
} from '../../../redux/slices/filterSlice';

import styles from './style.module.css';

const ACHasActiveHoursFilter = () => {
  const options = ['Все', 'С часами активности', 'Без часов активности'];
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(
    useSelector(selectAutoCampHasActiveHoursFilter)
  );
  const dispatch = useDispatch();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleFilterApply = () => {
    toggleDropdown();
    dispatch(setAutoCmpgHasActiveHours(selectedOptions));
  };

  const handleOptionChange = (event) => {
    const { value } = event.target;
    setSelectedOptions(value);
  };

  return (
    <div className={styles.dropdown}>
      <button
        className={`${styles.dropdownToggle} ${isOpen ? styles.open : ''}`}
        onClick={toggleDropdown}
      >
        Часы активности
        <span className={styles.arrow}>{isOpen ? '✕' : '▼'}</span>
      </button>
      {isOpen && (
        <div className={`${styles.dropdownMenu} ${isOpen ? styles.show : ''}`}>
          {options.map((option, index) => (
            <label key={index} className={styles.dropdownItem}>
              <input
                type="checkbox"
                value={option}
                checked={selectedOptions === option}
                onChange={handleOptionChange}
              />

              <span className={styles.customCheckbox}></span>
              {option}
            </label>
          ))}
          <div className={styles.drowdownActions}>
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

export default ACHasActiveHoursFilter;
