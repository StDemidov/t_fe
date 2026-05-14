import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setInventoryOrderNames, resetInventoryOrderNames, selectInventoryOrderNames,
} from '../../redux/inventoryFilterSlice';
import DropdownFilter from './_DropdownFilter';

const InventoryOrderNameFilter = ({ options }) => {
  const dispatch = useDispatch();
  const saved = useSelector(selectInventoryOrderNames);
  const [selected, setSelected] = useState(saved);
  // options already sorted from hook

  return (
    <DropdownFilter
      label="Заказ"
      options={options ?? []}
      selected={selected}
      onChange={setSelected}
      onApply={(s) => { setSelected(s); dispatch(setInventoryOrderNames(s)); }}
      onClose={() => setSelected(saved)}
      onReset={() => { setSelected([]); dispatch(resetInventoryOrderNames()); }}
    />
  );
};

export default InventoryOrderNameFilter;
