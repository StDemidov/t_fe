import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setInventoryPatterns, resetInventoryPatterns, selectInventoryPatterns,
} from '../../redux/inventoryFilterSlice';
import DropdownFilter from './_DropdownFilter';

const InventoryPatternFilter = ({ options }) => {
  const dispatch = useDispatch();
  const saved = useSelector(selectInventoryPatterns);
  const [selected, setSelected] = useState(saved);
  // options already sorted from hook

  return (
    <DropdownFilter
      label="Лекало"
      options={options ?? []}
      selected={selected}
      onChange={setSelected}
      onApply={(s) => { setSelected(s); dispatch(setInventoryPatterns(s)); }}
      onClose={() => setSelected(saved)}
      onReset={() => { setSelected([]); dispatch(resetInventoryPatterns()); }}
    />
  );
};

export default InventoryPatternFilter;
