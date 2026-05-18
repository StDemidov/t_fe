import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setInventoryCountries, resetInventoryCountries, selectInventoryCountries,
} from '../../redux/inventoryFilterSlice';
import DropdownFilter from './_DropdownFilter';

const InventoryCountryFilter = ({ options }) => {
  const dispatch = useDispatch();
  const saved = useSelector(selectInventoryCountries);
  const [selected, setSelected] = useState(saved);

  return (
    <DropdownFilter
      label="Страна"
      options={options ?? []}
      selected={selected}
      onChange={setSelected}
      onApply={(s) => { setSelected(s); dispatch(setInventoryCountries(s)); }}
      onReset={() => { setSelected([]); dispatch(resetInventoryCountries()); }}
      onClose={() => setSelected(saved)}
    />
  );
};

export default InventoryCountryFilter;
