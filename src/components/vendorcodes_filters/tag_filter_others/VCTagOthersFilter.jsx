import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setVendorCodeTagsOthersFilter,
  selectVCTagsOthersFilter,
  resetVendorCodeTagsOthersFilter,
} from '../../../redux/slices/filterSlice';

import styles from './style.module.css';

const VCTagOthersFilter = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(
    useSelector(selectVCTagsOthersFilter)
  );
  const dispatch = useDispatch();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleFilterApply = () => {
    toggleDropdown();
    dispatch(setVendorCodeTagsOthersFilter(selectedOptions));
  };

  const handleFilterReset = () => {
    setSelectedOptions([]);
    dispatch(resetVendorCodeTagsOthersFilter);
    dispatch(setVendorCodeTagsOthersFilter([]));
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
        Теги (доп.)
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
                value={option}
                checked={selectedOptions.includes(option)}
                onChange={handleOptionChange}
              />

              <span className={styles.customCheckbox}></span>
              {option}
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

export default VCTagOthersFilter;
