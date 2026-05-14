import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setInventoryVcNameQuery, resetInventoryVcNameQuery } from '../../redux/inventoryFilterSlice';
import styles from './filters.module.css';

const InventoryVcNameFilter = () => {
  const dispatch = useDispatch();
  const [value, setValue] = useState('');

  const handleChange = useCallback((e) => {
    const v = e.target.value;
    setValue(v);
    // If cleared, reset immediately
    if (v === '') dispatch(resetInventoryVcNameQuery());
  }, [dispatch]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      const trimmed = value.trim();
      // Only dispatch if non-empty, prevents re-triggering on empty
      if (trimmed.length > 0) {
        dispatch(setInventoryVcNameQuery(trimmed));
      } else {
        dispatch(resetInventoryVcNameQuery());
      }
    }
    if (e.key === 'Escape') {
      setValue('');
      dispatch(resetInventoryVcNameQuery());
    }
  }, [value, dispatch]);

  return (
    <input
      type="text"
      className={styles.searchInput}
      placeholder="Артикул / SKU..."
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
};

export default InventoryVcNameFilter;
