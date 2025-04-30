import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaSave } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

import { setError } from '../../../../redux/slices/errorSlice';

import styles from './style.module.css';
import {
  setNewSkusTagsOthers,
  setNewAvailableTagOthers,
} from '../../../../redux/slices/vendorCodeSlice';

const BodyTagsOthers = ({ tags, availableTagsOthers, skuId, tableRef }) => {
  const [selectedTags, setSelectedTags] = useState(tags);
  const [tempTags, setTempTags] = useState(tags);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dispatch = useDispatch();

  const newTagRef = useRef(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Открытие/закрытие списка
  const toggleDropdown = (reset = true) => {
    if (isDropdownOpen) {
      setTimeout(() => {
        setIsDropdownOpen(false);
        if (reset) {
          setTempTags(selectedTags);
        }
      }, 300);
      return;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
      });
    }
    if (reset) {
      setTempTags(selectedTags);
      setIsDropdownOpen(true);
    }
  };

  // Закрытие при клике вне окна
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleTableScroll = (event) => {
      if (
        tableRef?.current &&
        event.target === tableRef.current &&
        isDropdownOpen
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    tableRef?.current?.addEventListener('scroll', handleTableScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      tableRef?.current?.addEventListener('scroll', handleTableScroll);
    };
  }, [isDropdownOpen, tableRef]);

  const handleTagToggle = useCallback((tag) => {
    setTempTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // Добавление нового тега
  const handleAddTag = useCallback(() => {
    const newTag = newTagRef.current.value.trim();
    let check = availableTagsOthers.map((e) => {
      return e.toLowerCase();
    });

    if (newTag && !check.includes(newTag.toLowerCase())) {
      dispatch(setNewAvailableTagOthers([newTag]));
      newTagRef.current.value = '';
    } else {
      dispatch(setError('Тег пустой или такой тег уже существует'));
    }
  }, [availableTagsOthers]);

  // Подтверждение выбора
  const handleAccept = () => {
    setSelectedTags(tempTags);
    dispatch(setNewSkusTagsOthers({ [skuId]: tempTags }));
    setIsDropdownOpen(false);
  };

  return (
    <div className={styles.cell}>
      <div className={styles.tagsContainer}>
        <button
          ref={buttonRef}
          className={styles.addButton}
          onClick={() => toggleDropdown(true)}
        >
          +
        </button>
        {selectedTags.map((tag, index) => (
          <span key={index} className={styles.tag}>
            {tag}
          </span>
        ))}
        {isDropdownOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              className={styles.dropdown}
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }}
            >
              <h4>Выберите теги</h4>
              <div className={styles.tagList}>
                {availableTagsOthers.map((tag) => (
                  <div
                    key={tag}
                    className={`${styles.tagOption} ${
                      tempTags.includes(tag) ? styles.selected : ''
                    }`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </div>
                ))}
              </div>

              {/* Поле ввода и кнопка для создания нового тега */}
              <div className={styles.newTagContainer}>
                <div className={styles.newTagInputBox}>
                  <input
                    type="text"
                    className={styles.newTagInput}
                    placeholder="Новый тег..."
                    ref={newTagRef} // Теперь напрямую управляем инпутом
                  />
                  <button
                    className={styles.addTagButton}
                    onClick={handleAddTag}
                  >
                    <FaSave />
                  </button>
                </div>
                <button className={styles.acceptButton} onClick={handleAccept}>
                  Принять
                </button>
              </div>
            </div>,
            document.body
          )}
      </div>

      {/* Выпадающее окно рендерится через портал в body */}
    </div>
  );
};

export default BodyTagsOthers;
