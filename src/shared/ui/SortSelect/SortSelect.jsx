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
 * Выпадающий селектор сортировки — единичный выбор с мгновенным применением.
 * По дизайну повторяет DropdownFilter, но без поиска и кнопок «Применить/Сброс»:
 * клик по опции сразу закрывает список и вызывает onChange.
 *
 * Направление (по возрастанию/убыванию) определяется по суффиксу значения
 * (`:asc`/`:desc`) и показывается иконкой рядом с названием.
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.label] — подпись слева от селектора
 * @param {Array<{ value: string, label: string }>} props.options — варианты сортировки
 * @param {string} props.value — выбранное значение
 * @param {(value: string) => void} props.onChange — вызов при выборе варианта
 * @param {boolean} [props.disabled=false] — блокирует открытие селектора
 */
const SortSelect = ({
  label,
  options = [],
  value,
  onChange,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

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

  return (
    <div className={styles.root} ref={rootRef}>
      {label && <span className={styles.caption}>{label}</span>}
      <div className={styles.wrap}>
        <button
          type="button"
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
          role="listbox"
          aria-hidden={!open}
        >
          <div className={styles.list}>
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  type="button"
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.option} ${
                    isSelected ? styles.optionSelected : ''
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
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
        </div>
      </div>
    </div>
  );
};

export default SortSelect;
