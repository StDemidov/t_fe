import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './filters.module.css';

const DropdownFilter = ({ label, options, selected, onChange, onApply, onReset, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const computePos = useCallback(() => {
    if (!btnRef.current) return {};
    const r = btnRef.current.getBoundingClientRect();
    return { top: r.bottom + 4, left: r.left, minWidth: Math.max(r.width, 210) };
  }, []);

  const openMenu = () => { setMenuStyle(computePos()); setSearchQuery(''); setIsOpen(true); };

  useEffect(() => {
    if (!isOpen) return;
    const update = () => setMenuStyle(computePos());
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
  }, [isOpen, computePos]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) {
        setIsOpen(false);
        onClose?.();
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
    // Note: mousedown used (not click) to close before new click opens another dropdown
  }, [isOpen]);

  const toggle = (v) => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  const handleApply = () => { onApply(selected); setIsOpen(false); };
  const handleReset = () => { if (selected.length > 0) { onReset(); } };

  const safeOptions = options ?? [];
  const filtered = safeOptions.filter(o => o.toLowerCase().includes(searchQuery.toLowerCase()));
  const hasSelections = selected.length > 0;

  return (
    <div className={styles.dropdown}>
      <button
        ref={btnRef} type="button"
        className={`${styles.toggleBtn} ${isOpen || hasSelections ? styles.toggleBtnActive : ''}`}
        onClick={() => { if (isOpen) { setIsOpen(false); onClose?.(); } else openMenu(); }}
      >
        {label}
        {hasSelections && <span className={styles.badge}>{selected.length}</span>}
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div ref={menuRef} className={styles.menu} style={menuStyle}>
          <div className={styles.menuSearch}>
            <input type="text" className={styles.menuSearchInput} placeholder="Поиск..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className={styles.menuScroll}>
            {filtered.length === 0 && <div className={styles.menuEmpty}>Ничего не найдено</div>}
            {(filtered ?? []).map(opt => (
              <label key={opt} className={styles.menuItem}>
                <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          {/* Both buttons always visible */}
          <div className={styles.menuActions}>
            <button type="button" className={styles.resetBtn} onMouseDown={e => e.preventDefault()} onClick={handleReset} disabled={!hasSelections}>
              Сбросить
            </button>
            <button type="button" className={styles.applyBtn} onMouseDown={e => e.preventDefault()} onClick={handleApply}>Применить</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownFilter;
