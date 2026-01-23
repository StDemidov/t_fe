import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  setVendorCodeTagsClothFilter,
  selectVCTagsClothFilter,
  resetVendorCodeTagsClothFilter,
} from '../../../redux/slices/filterSlice';

import styles from './style.module.css';

const VCTagClothFilter = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(
    useSelector(selectVCTagsClothFilter)
  );
  const sortedOptions = options.slice();
  sortedOptions.sort();
  const dispatch = useDispatch();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleFilterApply = () => {
    toggleDropdown();
    dispatch(setVendorCodeTagsClothFilter(selectedOptions));
  };

  const handleFilterReset = () => {
    setSelectedOptions([]);
    dispatch(resetVendorCodeTagsClothFilter);
    dispatch(setVendorCodeTagsClothFilter([]));
  };

  const handleOptionChange = (event) => {
    const { value, checked } = event.target;
    let newSelectedOptions = [...selectedOptions];

    if (checked) {
      newSelectedOptions.push(value);
    } else {
      newSelectedOptions = newSelectedOptions.filter(
        (option) => option !== value
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
        Теги (ткань)
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
          {sortedOptions.map((option, index) => (
            <label key={index} className={styles.dropdownItem}>
              <input
                type="checkbox"
                value={option}
                checked={selectedOptions.includes(option)}
                onChange={handleOptionChange}
              />

              <span className={styles.customCheckbox}></span>
              {option}
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

export default VCTagClothFilter;
