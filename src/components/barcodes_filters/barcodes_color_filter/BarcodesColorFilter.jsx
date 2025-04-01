import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setBarcodeColorFilter,
  selectBarcodeColorFilter,
  resetBarcodeColorFilter,
} from '../../../redux/slices/filterSlice';

import styles from './style.module.css';

const BarcodesColorFilter = () => {
  const options = [
    ['Красный', '#FF0000'],
    ['Зеленый', '#00FF00'],
    ['Синий', '#0000FF'],
    ['Желтый', '#FFFF00'],
    ['Розовый', '#FF00FF'],
    ['Голубой', '#00FFFF'],
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(
    useSelector(selectBarcodeColorFilter)
  );
  const dispatch = useDispatch();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleFilterApply = () => {
    toggleDropdown();
    dispatch(setBarcodeColorFilter(selectedOptions));
  };

  const handleFilterReset = () => {
    setSelectedOptions([]);
    dispatch(resetBarcodeColorFilter);
    dispatch(setBarcodeColorFilter([]));
  };

  const handleOptionChange = (event) => {
    const { value, checked } = event.target;
    let newSelectedOptions = [...selectedOptions];

    if (checked) {
      newSelectedOptions.push(value);
    } else {
      newSelectedOptions = newSelectedOptions.filter(
        (option) => option[1] !== value
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
        {isOpen ? 'Цвет заказа' : 'Цвета заказов'}
        <span className={styles.arrow}>
          {selectedOptions.length !== 0 ? (
            <span
              className={styles.circle}
            >{`${selectedOptions.length}  `}</span>
          ) : (
            <span />
          )}
          {isOpen ? '✕' : '▼'}
        </span>
      </button>
      {isOpen && (
        <div className={`${styles.dropdownMenu} ${isOpen ? styles.show : ''}`}>
          {options.map((option, index) => (
            <label key={index} className={styles.dropdownItem}>
              <input
                type="checkbox"
                value={option[1]}
                checked={selectedOptions.includes(option[1])}
                onChange={handleOptionChange}
              />

              <span className={styles.customCheckbox}></span>
              {option[0]}
            </label>
          ))}
          <div className={styles.dropdownActions}>
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

export default BarcodesColorFilter;
