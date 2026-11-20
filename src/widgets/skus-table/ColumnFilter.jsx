import { useEffect, useRef, useState } from 'react';
import { MdFilterAlt } from 'react-icons/md';
import { isColumnFilterActive } from './columnFilters';
import styles from './ColumnFilter.module.css';

const OPERATORS = [
  { value: 'eq', label: 'Равно' },
  { value: 'neq', label: 'Не равно' },
  { value: 'gt', label: 'Больше' },
  { value: 'gte', label: 'Больше или равно' },
  { value: 'lt', label: 'Меньше' },
  { value: 'lte', label: 'Меньше или равно' },
  { value: 'between', label: 'Между' },
];

/**
 * Числовой фильтр «как в Excel» для колонки таблицы: кнопка в заголовке,
 * по клику — панель с выпадающим списком секции (если секций несколько),
 * списком оператора и значением (для «Между» — два). Применяется по кнопке
 * «Применить».
 *
 * @param {object} props
 * @param {Array<{ value: string, label: string }>} props.sections — секции
 *   колонки; одна секция — выбор секции не показывается
 * @param {object|null} props.value — применённый фильтр (null — не задан)
 * @param {(filter: object|null) => void} props.onApply — вызов по «Применить»
 */
const ColumnFilter = ({ sections, value, onApply }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  const emptyDraft = () => ({
    section: sections[0].value,
    op: 'eq',
    value: '',
    valueTo: '',
  });

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

  // При открытии начинаем с применённого фильтра (копия, не ссылка).
  useEffect(() => {
    if (!open) return;
    setDraft(value ? { ...value } : emptyDraft());
    setPos(computePos());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, value]);

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

  const patchDraft = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const handleApply = () => {
    setOpen(false);
    onApply(isColumnFilterActive(draft) ? draft : null);
  };

  const handleReset = () => setDraft(emptyDraft());

  const active = isColumnFilterActive(value);
  const hasSections = sections.length > 1;

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`${styles.trigger} ${active ? styles.triggerActive : ''}`}
        title="Фильтр по значениям колонки"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <MdFilterAlt />
      </button>

      <div
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        style={pos}
        aria-hidden={!open}
      >
        {draft && (
          <>
            {hasSections && (
              <>
                <span className={styles.fieldLabel}>Данные для фильтрации</span>
                <select
                  className={styles.select}
                  value={draft.section}
                  onChange={(e) => patchDraft({ section: e.target.value })}
                >
                  {sections.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </>
            )}
            <span className={styles.fieldLabel}>Фильтр</span>
            <select
              className={styles.select}
              value={draft.op}
              onChange={(e) => patchDraft({ op: e.target.value })}
            >
              {OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
            <div className={styles.valueRow}>
              <input
                type="number"
                className={styles.valueInput}
                value={draft.value}
                placeholder={draft.op === 'between' ? 'от' : 'Значение'}
                onChange={(e) => patchDraft({ value: e.target.value })}
              />
              {draft.op === 'between' && (
                <input
                  type="number"
                  className={styles.valueInput}
                  value={draft.valueTo}
                  placeholder="до"
                  onChange={(e) => patchDraft({ valueTo: e.target.value })}
                />
              )}
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.resetButton}
                onClick={handleReset}
                disabled={!isColumnFilterActive(draft)}
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
          </>
        )}
      </div>
    </div>
  );
};

export default ColumnFilter;
