import { useEffect, useMemo, useRef, useState } from 'react';
import { MdFilterAlt } from 'react-icons/md';
import styles from './TagsFilter.module.css';

const normalize = (value) => String(value).toLowerCase();

/**
 * Фильтр колонки тегов: иконка в заголовке колонки, по клику — панель
 * с поиском и множественным выбором (как DropdownFilter на странице).
 * Применяется по кнопке «Применить»; активный фильтр подсвечивает иконку.
 *
 * @param {object} props
 * @param {Array<{ value: string, label: string }>} props.options
 * @param {Array<string>} props.selected — применённые значения
 * @param {(values: Array<string>) => void} props.onApply
 */
const TagsFilter = ({ options = [], selected = [], onApply }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState([]);
  const [search, setSearch] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);

  // Панель позиционируется фиксированно от кнопки, чтобы не обрезаться
  // скролл-контейнером таблицы; прижимаем к правому краю вьюпорта.
  const computePos = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return {};
    const width = 280;
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

  // Репозиционирование при скролле (в т.ч. внутри таблицы) и ресайзе.
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
    setDraft((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleApply = () => {
    setOpen(false);
    onApply(draft);
  };

  const handleReset = () => setDraft([]);

  const active = selected.length > 0;

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`${styles.trigger} ${active ? styles.triggerActive : ''}`}
        title="Фильтр по тегам"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <MdFilterAlt />
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
          placeholder="Поиск…"
        />
        <div className={styles.list} role="listbox">
          {visibleOptions.length === 0 ? (
            <div className={styles.empty}>Ничего не найдено</div>
          ) : (
            visibleOptions.map((option) => {
              const isSelected = draftSet.has(option.value);
              return (
                <button
                  type="button"
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                  onClick={() => toggleOption(option.value)}
                >
                  <span
                    className={`${styles.checkbox} ${isSelected ? styles.checkboxOn : ''}`}
                    aria-hidden="true"
                  />
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

export default TagsFilter;
