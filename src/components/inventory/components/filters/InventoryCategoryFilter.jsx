import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setInventoryCategories, resetInventoryCategories, selectInventoryCategories,
} from '../../redux/inventoryFilterSlice';
import DropdownFilter from './_DropdownFilter';

const InventoryCategoryFilter = ({ options }) => {
  const dispatch = useDispatch();
  const saved = useSelector(selectInventoryCategories);
  const [selected, setSelected] = useState(saved);

  return (
    <DropdownFilter
      label="Категории"
      options={options ?? []}
      selected={selected}
      onChange={setSelected}
      onApply={(s) => dispatch(setInventoryCategories(s))}
      onClose={() => setSelected(saved)}
      onReset={() => { setSelected([]); dispatch(resetInventoryCategories()); }}
    />
  );
};

export default InventoryCategoryFilter;
