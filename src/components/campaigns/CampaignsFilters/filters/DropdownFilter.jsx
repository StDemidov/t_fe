import React, { useState, useRef, useEffect } from 'react';
import styles from './style.module.css';

const DropdownFilter = ({
  options,
  selectedOptions,
  setSelectedOptions,
  handleFilterApply,
  handleFilterReset,
  title,
  sorting = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const dropdownRef = useRef(null);
  const toggleRef = useRef(null);

  const toggleDropdown = () => {
    if (!isOpen && toggleRef.current) {
      const toggleRect = toggleRef.current.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        top: toggleRect.bottom + window.scrollY,
        left: toggleRect.left + window.scrollX,
        width: toggleRect.width,
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Обработчик для чекбоксов/радио кнопок
  const handleChange = (event) => {
    const { value, checked } = event.target;
    const normalizedValue = String(value);

    if (sorting) {
      // Режим радио-кнопок (один выбор)
      if (checked) {
        setSelectedOptions(value);
      }
    } else {
      // Режим чекбоксов (множественный выбор)
      let newSelectedOptions;

      if (checked) {
        if (!selectedOptions.some((opt) => String(opt) === normalizedValue)) {
          newSelectedOptions = [...selectedOptions, value];
        } else {
          newSelectedOptions = [...selectedOptions];
        }
      } else {
        newSelectedOptions = selectedOptions.filter(
          (option) => String(option) !== normalizedValue
        );
      }

      setSelectedOptions(newSelectedOptions);
    }
  };

  // Проверка, выбран ли элемент
  const isOptionSelected = (optionKey) => {
    if (sorting) {
      // Для сортировки - прямое сравнение (selectedOptions - строка)
      return selectedOptions === String(optionKey);
    } else {
      // Для фильтров - проверка наличия в массиве
      return selectedOptions.some((opt) => String(opt) === String(optionKey));
    }
  };

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button
        ref={toggleRef}
        className={`${styles.dropdownToggle} ${isOpen ? styles.open : ''}`}
        onClick={toggleDropdown}
      >
        {title}
        <span className={styles.arrow}>
          {!sorting && selectedOptions.length !== 0 ? (
            <span className={styles.circle}>{selectedOptions.length}</span>
          ) : null}
          {isOpen ? '✕' : '▼'}
        </span>
      </button>
      {isOpen && (
        <div
          className={`${styles.dropdownMenu} ${styles.show} ${styles.fixed}`}
          style={menuStyle}
        >
          {options.map((option, index) => (
            <label key={index} className={styles.dropdownItem}>
              <input
                type={sorting ? 'radio' : 'checkbox'}
                name={sorting ? 'sorting-option' : undefined}
                value={option.key}
                checked={isOptionSelected(option.key)}
                onChange={handleChange}
              />
              <span className={styles.customCheckbox}></span>
              {option.name}
            </label>
          ))}
          <div className={styles.dropdownActions}>
            <button
              className={styles.dropdownReset}
              onClick={handleFilterReset}
              disabled={
                sorting
                  ? selectedOptions === options[0]?.key // Для сортировки - проверяем, не выбран ли дефолтный
                  : !selectedOptions.length
              }
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

export default DropdownFilter;
