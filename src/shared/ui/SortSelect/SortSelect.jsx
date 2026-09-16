import { useEffect, useRef, useState } from 'react';
import { CgSortAz, CgSortZa } from 'react-icons/cg';
import styles from './SortSelect.module.css';

/**
 * Иконка направления сортировки по суффиксу значения:
 * `:asc` — по возрастанию, `:desc` — по убыванию.
 */
const DirectionIcon = ({ value }) => {
  if (value.endsWith(':asc')) return <CgSortZa />;
  if (value.endsWith(':desc')) return <CgSortAz />;
  return null;
};

/**
 * Выпадающий селектор сортировки с кнопками «Применить» / «Отмена».
 *
 * Клик по опции запоминает выбор во внутреннем «чертеже» (draft); при
 * «Применить» вызывается onChange и список закрывается. «Отмена» сбрасывает
 * выбор и закрывает панель. Направление (asc/desc) показывается иконкой
 * рядом с чекбоксом в панели.
 *
 * @param {object} props
 * @param {Array<{ value: string, label: string }>} props.options — варианты сортировки
 * @param {string} props.value — выбранное значение
 * @param {(value: string) => void} props.onChange — вызов при «Применить»
 * @param {boolean} [props.disabled=false] — блокирует открытие селектора
 */
const SortSelect = ({
  options = [],
  value,
  onChange,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  // При открытии начинаем с текущего значения.
  useEffect(() => {
    if (!open) return;
    setDraft(value);
  }, [open, value]);

  // Позиция панели относительно вьюпорта (fixed), чтобы она не обрезалась
  // переполнением родителя (напр. overflow-x родительской строки).
  const computePos = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return {};
    const width = Math.max(rect.width, 240);
    const margin = 16;
    const left = Math.min(rect.left, window.innerWidth - width - margin);
    return { top: rect.bottom + 4, left: Math.max(left, margin), width };
  };

  useEffect(() => {
    if (!open) return;
    setPos(computePos());
  }, [open]);

  // Панель позиционируется фиксированно: при скролле/ресайзе обновляем координаты.
  useEffect(() => {
    if (!open) return;
    const update = () => setPos(computePos());
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  // Закрытие по клику вне и по Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ??
    options[0]?.label;

  const handleApply = () => {
    onChange(draft);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.wrap}>
        <button
          type="button"
          ref={triggerRef}
          className={styles.trigger}
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          disabled={disabled}
        >
          <span className={styles.triggerLabel}>{selectedLabel}</span>
          <span className={styles.directionIcon}>
            <DirectionIcon value={value} />
          </span>
          <span
            className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          >
            ▾
          </span>
        </button>

        <div
          className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
          style={pos}
          role="listbox"
          aria-hidden={!open}
        >
          <div className={styles.list}>
            {options.map((option) => {
              const isSelected = draft === option.value;
              return (
                <button
                  type="button"
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.option} ${
                    isSelected ? styles.optionSelected : ''
                  }`}
                  onClick={() => setDraft(option.value)}
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                  <span className={styles.optionRight}>
                    <span className={styles.directionIcon}>
                      <DirectionIcon value={option.value} />
                    </span>
                    <span
                      className={`${styles.check} ${
                        isSelected ? styles.checkOn : ''
                      }`}
                      aria-hidden="true"
                    />
                  </span>
                </button>
              );
            })}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.resetButton}
              onClick={handleCancel}
            >
              Отмена
            </button>
            <button
              type="button"
              className={styles.applyButton}
              onClick={handleApply}
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortSelect;
