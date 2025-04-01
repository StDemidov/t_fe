import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectBarcodeSortingType,
  setBarcodeSortingType,
} from '../../../redux/slices/filterSlice';

import styles from './style.module.css';

const BarcodesSorting = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSorting, setSelectedSorting] = useState(
    useSelector(selectBarcodeSortingType)
  );
  const dispatch = useDispatch();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSortingApply = () => {
    toggleDropdown();
    dispatch(setBarcodeSortingType(selectedSorting));
  };

  const handleOptionChange = (event) => {
    const { value } = event.target;

    setSelectedSorting(value);
  };

  const options = [
    'EBITDA (сред) ↓',
    'EBITDA (сред) ↑',
    'EBITDA/день (сред) ↓',
    'EBITDA/день (сред) ↑',
    'Заказы ↓',
    'Заказы ↑',
    'От новых к старым',
    'От старых к новым',
  ];

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

export default BarcodesSorting;
