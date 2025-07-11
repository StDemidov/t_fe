import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoMdRefresh } from 'react-icons/io';

import styles from './style.module.css';

const deepClone = (data) => JSON.parse(JSON.stringify(data));

const ColumnSettingsModal = ({
  open,
  onClose,
  currentColumns,
  initialColumns,
  onApply,
}) => {
  const [localColumns, setLocalColumns] = useState([]);

  // Load a fresh copy on open
  useEffect(() => {
    if (open) {
      setLocalColumns(deepClone(currentColumns));
    }
  }, [open, currentColumns]);

  // ESC key closes the modal (no apply)
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose(); // just closes, no apply
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(localColumns);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setLocalColumns(reordered);
  };

  const toggleVisibility = (index) => {
    const updated = [...localColumns];
    updated[index].hidden = !updated[index].hidden;
    setLocalColumns(updated);
  };

  const handleReset = () => {
    setLocalColumns(deepClone(initialColumns));
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Настройка колонок</h2>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="columns">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef}>
                {localColumns.map((col, index) => (
                  <Draggable key={col.key} draggableId={col.key} index={index}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={styles.columnItem}
                        style={{
                          opacity: col.hidden ? 0.4 : 1,
                          transition: 'opacity 0.3s ease',
                          ...provided.draggableProps.style,
                        }}
                      >
                        <div className={styles.leftSide}>
                          <span className={styles.dragHandle}>⋮⋮</span>
                          <span>{col.label}</span>
                        </div>
                        <span
                          className={styles.eyeIcon}
                          onClick={() => toggleVisibility(index)}
                          title={col.hidden ? 'Показать' : 'Скрыть'}
                        >
                          {col.hidden ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

        <div className={styles.footer}>
          <IoMdRefresh className={styles.refreshButton} onClick={handleReset} />
          <div style={{ flex: 1 }} />
          <button onClick={onClose}>Отмена</button>
          <button onClick={() => onApply(localColumns)}>Применить</button>
        </div>
      </div>
    </div>
  );
};

export default ColumnSettingsModal;
