import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRegroupedItems,
  selectSelectedSkus,
} from '../../../../redux/slices/regroupSlice';
import { useState, useEffect, useRef } from 'react';

import styles from './style.module.css';
import { hostName } from '../../../../utils/host';

const FinalSettings = () => {
  const selectedSkus = useSelector(selectSelectedSkus);
  const [groupsCount, setGroupsCount] = useState(1);
  const [inputValue, setInputValue] = useState('1');

  const dispatch = useDispatch();

  // Сбрасываем значение на 1, когда список SKU меняется
  useEffect(() => {
    setGroupsCount(1);
    setInputValue('1');
  }, [selectedSkus]);

  const handleGroupsCountChange = (e) => {
    let rawValue = e.target.value;
    setInputValue(rawValue);

    // Если поле пустое
    if (rawValue === '') {
      return;
    }

    // Проверяем, что ввод состоит только из цифр
    if (!/^\d+$/.test(rawValue)) {
      return;
    }

    let numValue = Number(rawValue);
    const max = selectedSkus.length;

    // Если число валидное и не превышает max, обновляем groupsCount
    if (numValue >= 1 && numValue <= max) {
      setGroupsCount(numValue);
    }
  };

  const handleBlur = () => {
    // При потере фокуса проверяем и корректируем значение
    if (inputValue === '') {
      setGroupsCount(1);
      setInputValue('1');
      return;
    }

    let numValue = Number(inputValue);
    const max = selectedSkus.length;

    if (isNaN(numValue) || numValue < 1) {
      setGroupsCount(1);
      setInputValue('1');
    } else if (numValue > max) {
      setGroupsCount(max);
      setInputValue(String(max));
    } else {
      setGroupsCount(numValue);
      setInputValue(String(numValue));
    }
  };

  const handleKeyDown = (e) => {
    // Блокируем ввод точки, запятой, минуса и других нечисловых символов
    if (
      e.key === '.' ||
      e.key === ',' ||
      e.key === '-' ||
      e.key === 'e' ||
      e.key === 'E'
    ) {
      e.preventDefault();
    }

    // Разрешаем Backspace, Delete, Tab, Escape, Enter
    if (e.key === 'Backspace') {
      return;
    }

    // Разрешаем стрелки вверх/вниз
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      return;
    }

    // Блокируем все, что не является цифрой
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleApply = () => {
    const data = {
      groups_count: groupsCount,
      skus_for_destribution: selectedSkus,
    };

    dispatch(
      fetchRegroupedItems({
        data: data,
        url: `${hostName}/card_grouping/distribute_items_by_groups`,
      })
    );
  };

  return (
    <div>
      <div className={styles.finalSettings}>
        <div className={styles.numOfSkus}>
          <label>Выбрано SKU</label>
          <span>{selectedSkus.length}</span>
        </div>
        <div className={styles.inputGroups}>
          <label>Количество групп</label>
          <div>
            <input
              type="text"
              value={inputValue}
              onChange={handleGroupsCountChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              disabled={selectedSkus.length === 0}
              style={{ width: '60px', textAlign: 'center' }}
            />
          </div>
        </div>
        <button
          className={
            selectedSkus.length === 0 || groupsCount > selectedSkus.length
              ? styles.disabledButton
              : styles.applyButton
          }
          disabled={
            selectedSkus.length === 0 || groupsCount > selectedSkus.length
          }
          onClick={handleApply}
        >
          Рассчитать новые группы
        </button>
      </div>
    </div>
  );
};

export default FinalSettings;
