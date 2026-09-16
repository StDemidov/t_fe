import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './DropdownFilter.module.css';

const normalize = (value) => String(value).toLowerCase();

/**
 * Выпадающий фильтр с поиском по значениям.
 *
 * - Режим «единичный» (single) или «множественный» (multiple) выбор.
 * - Значения сортируются по алфавиту (а-я/a-z), порядок исходного массива не важен.
 * - Фильтр применяется только по кнопке «Применить»; сброс — кнопкой «Сброс»,
 *   активной только при имеющихся выборах.
 * - Во множественном режиме у названия появляется плашка с кол-вом применённых
 *   значений; в единичном режиме название меняется на выбранное значение.
 * - Взаимоисключение с другими фильтрами: значение можно пометить `disabled`,
 *   оно тогда отображается, но недоступно для выбора.
 *
 * @param {object} props
 * @param {string} props.title — название фильтра в закрытом состоянии
 * @param {'single'|'multiple'} [props.mode='multiple'] — тип выбора
 * @param {Array<{ value: string, label: string, disabled?: boolean }>} props.options
 * @param {Array<string>} props.selected — применённые значения
 * @param {(values: Array<string>) => void} props.onApply — вызов при «Применить»
 * @param {boolean} [props.disabled=false] — блокирует открытие фильтра
 * @param {string} [props.placeholder='Поиск…'] — плейсхолдер поисковой строки
 */
const DropdownFilter = ({
  title,
  mode = 'multiple',
  options = [],
  selected = [],
  onApply,
  disabled = false,
  placeholder = 'Поиск…',
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState([]);
  const [search, setSearch] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);

  // Вычисляем позицию панели относительно вьюпорта (fixed), чтобы она не
  // обрезалась переполнением родителя (напр. overflow-x родительской строки).
  const computePos = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return {};
    // Панель фиксированной ширины прижимаем к краю вьюпорта, чтобы она не
    // уходила за правый край экрана у крайних фильтров.
    const width = Math.max(rect.width, 280);
    const margin = 16;
    const left = Math.min(rect.left, window.innerWidth - width - margin);
    return { top: rect.bottom + 4, left: Math.max(left, margin), width };
  };

  // При открытии начинаем с применённых значений, чистим поиск и фокусируем его.
  useEffect(() => {
    if (!open) return;
    setDraft(selected);
    setSearch('');
    setPos(computePos());
    searchRef.current?.focus();
  }, [open, selected]);

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
        searchRef.current?.blur();
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        searchRef.current?.blur();
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const visibleOptions = useMemo(() => {
    const q = normalize(search.trim());
    const filtered = q
      ? options.filter((option) => normalize(option.label).includes(q))
      : options;
    return [...filtered].sort((a, b) =>
      a.label.localeCompare(b.label, 'ru', { sensitivity: 'base' })
    );
  }, [options, search]);

  const draftSet = useMemo(() => new Set(draft), [draft]);

  const toggleOption = (value) => {
    if (mode === 'single') {
      setDraft([value]);
      return;
    }
    setDraft((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleApply = () => {
    searchRef.current?.blur();
    setOpen(false);
    onApply(mode === 'single' ? draft.slice(0, 1) : draft);
  };

  const handleReset = () => setDraft([]);

  const appliedSingleLabel =
    mode === 'single'
      ? options.find((option) => selected.includes(option.value))?.label
      : null;

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className={styles.trigger}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        disabled={disabled}
      >
        <span className={styles.triggerLabel}>
          {mode === 'single' && appliedSingleLabel
            ? appliedSingleLabel
            : title}
        </span>
        {mode === 'multiple' && selected.length > 0 && (
          <span className={styles.count}>{selected.length}</span>
        )}
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
        <input
          ref={searchRef}
          type="text"
          className={styles.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
        />
          <div className={styles.list} role="listbox">
            {visibleOptions.length === 0 ? (
              <div className={styles.empty}>Ничего не найдено</div>
            ) : (
              visibleOptions.map((option) => {
                const isSelected = draftSet.has(option.value);
                const isDisabled = option.disabled && !isSelected;
                return (
                  <button
                    type="button"
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                    disabled={isDisabled}
                    onClick={() => toggleOption(option.value)}
                  >
                    {mode === 'multiple' && (
                      <span
                        className={`${styles.checkbox} ${isSelected ? styles.checkboxOn : ''}`}
                        aria-hidden="true"
                      />
                    )}
                    <span className={styles.optionLabel}>{option.label}</span>
                  </button>
                );
              })
            )}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.resetButton}
              onClick={handleReset}
              disabled={draft.length === 0}
            >
              Сброс
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
  );
};

export default DropdownFilter;
