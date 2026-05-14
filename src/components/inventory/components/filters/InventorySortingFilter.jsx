import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setInventorySortingType, selectInventorySortingType } from '../../redux/inventoryFilterSlice';
import { SORTING_OPTIONS } from '../../utils/inventoryHelpers';
import styles from './filters.module.css';

const InventorySortingFilter = () => {
  const dispatch = useDispatch();
  const current = useSelector(selectInventorySortingType);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(current);
  const [menuStyle, setMenuStyle] = useState({});
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const computePos = useCallback(() => {
    if (!btnRef.current) return {};
    const r = btnRef.current.getBoundingClientRect();
    return { top: r.bottom + 4, left: r.left, minWidth: Math.max(r.width, 230) };
  }, []);

  const openMenu = () => { setMenuStyle(computePos()); setIsOpen(true); };
  const handleClose = () => { setIsOpen(false); setSelected(current); }; // reset on close

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
      if (menuRef.current && !menuRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target))
        handleClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isOpen]);

  return (
    <div className={styles.dropdown}>
      <button ref={btnRef} type="button"
        className={`${styles.toggleBtn} ${isOpen ? styles.toggleBtnActive : ''}`}
        onClick={() => isOpen ? handleClose() : openMenu()}
      >
        {selected}
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div ref={menuRef} className={styles.menu} style={menuStyle}>
          <div className={styles.menuScroll}>
            {SORTING_OPTIONS.map(opt => (
              <label key={opt} className={styles.menuItem}>
                <input type="checkbox" checked={selected === opt} onChange={() => setSelected(opt)} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          <div className={styles.menuActions}>
<button className={styles.applyBtn} onClick={() => { dispatch(setInventorySortingType(selected)); setIsOpen(false); }}>Применить</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default InventorySortingFilter;
