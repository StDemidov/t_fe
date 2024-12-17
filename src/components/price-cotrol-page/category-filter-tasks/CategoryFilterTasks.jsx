import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  selectTasksCategory,
  setTasksCategory,
  resetTasksCategory,
} from '../../../redux/slices/filterSlice';

import styles from './style.module.css';

const CategoryFilterTasks = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCategory = useSelector(selectTasksCategory);
  const dispatch = useDispatch();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleFilterApply = (e) => {
    toggleDropdown();
    const data = e.currentTarget.getAttribute('value').split(',');
    dispatch(setTasksCategory({ name: data.at(0), id: data.at(1) }));
  };

  return (
    <div className={styles.dropdown}>
      <button
        className={`${styles.dropdownToggle} ${isOpen ? styles.open : ''}`}
        onClick={toggleDropdown}
        type="button"
      >
        {selectedCategory ? selectedCategory.name : 'Выберите категорию'}
        <span className={styles.arrow}>{isOpen ? '✕' : '▼'}</span>
      </button>
      {isOpen && (
        <div className={`${styles.dropdownMenu} ${isOpen ? styles.show : ''}`}>
          {options.map((option, index) => (
            <button
              key={uuidv4()}
              className={styles.dropdownItem}
              type="button"
              value={`${option.name},${option.id}`}
              onClick={handleFilterApply}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryFilterTasks;
