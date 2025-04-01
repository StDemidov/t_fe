import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAutoCampSortingType,
  setAutoCmpgSortingType,
} from '../../../redux/slices/filterSlice';

import styles from './style.module.css';

const ACSorting = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSorting, setSelectedSorting] = useState(
    useSelector(selectAutoCampSortingType)
  );
  const dispatch = useDispatch();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSortingApply = () => {
    toggleDropdown();
    dispatch(setAutoCmpgSortingType(selectedSorting));
  };

  const handleOptionChange = (event) => {
    const { value } = event.target;

    setSelectedSorting(value);
  };

  const options = ['CTR ↓', 'CTR ↑', 'Затраты ↓', 'Затраты ↑'];

  return (
    <div className={styles.dropdown}>
      <button
        className={`${styles.dropdownToggle} ${isOpen ? styles.open : ''}`}
        onClick={toggleDropdown}
      >
        {selectedSorting}
        <span className={styles.arrow}>{isOpen ? '✕' : '▼'}</span>
      </button>
      {isOpen && (
        <div className={`${styles.dropdownMenu} ${isOpen ? styles.show : ''}`}>
          {options.map((option, index) => (
            <label key={index} className={styles.dropdownItem}>
              <input
                type="checkbox"
                value={option}
                checked={selectedSorting === option}
                onChange={handleOptionChange}
              />

              <span className={styles.customCheckbox}></span>
              {option}
            </label>
          ))}
          <div className={styles.drowdownActions}>
            <button
              className={styles.dropdownClose}
              onClick={handleSortingApply}
            >
              Применить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ACSorting;
