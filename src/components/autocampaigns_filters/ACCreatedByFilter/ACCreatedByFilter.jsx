import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setAutoCmpgCreatedBy,
  resetAutoCmpgCreatedBy,
  selectAutoCampCreatedByFilter,
} from '../../../redux/slices/filterSlice';

import styles from './style.module.css';

const ACCreatedByFilter = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(
    useSelector(selectAutoCampCreatedByFilter)
  );
  const dispatch = useDispatch();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleFilterApply = () => {
    toggleDropdown();
    dispatch(setAutoCmpgCreatedBy(selectedOptions));
  };

  const handleFilterReset = () => {
    setSelectedOptions('');
    dispatch(resetAutoCmpgCreatedBy);
  };

  const handleOptionChange = (event) => {
    const { value, checked } = event.target;
    let newSelectedOptions = value;

    if (checked) {
      setSelectedOptions(newSelectedOptions);
    }
  };

  return (
    <div className={styles.dropdown}>
      <button
        className={`${styles.dropdownToggle} ${isOpen ? styles.open : ''}`}
        onClick={toggleDropdown}
      >
        Контроль
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
              {option === 'NOT_SOFT' ? 'Ручной контроль' : 'Автоматический'}
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

export default ACCreatedByFilter;
