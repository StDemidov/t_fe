import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectVCSortingType,
  setVCSortingType,
} from '../../../redux/slices/filterSlice';

import styles from './style.module.css';

const VCSorting = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSorting, setSelectedSorting] = useState(
    useSelector(selectVCSortingType)
  );
  const dispatch = useDispatch();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSortingApply = () => {
    toggleDropdown();
    dispatch(setVCSortingType(selectedSorting));
  };

  const handleOptionChange = (event) => {
    const { value } = event.target;

    setSelectedSorting(value);
  };

  const options = [
    'EBITDA / день (сумм.) убыв.',
    'EBITDA / день (сумм.) возр.',
    'ABC убыв.',
    'ABC возр.',
    'Заказы убыв.',
    'Заказы возр.',
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

export default VCSorting;
