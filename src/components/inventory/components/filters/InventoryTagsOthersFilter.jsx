import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setInventoryTagsOthers, resetInventoryTagsOthers, selectInventoryTagsOthers,
} from '../../redux/inventoryFilterSlice';
import DropdownFilter from './_DropdownFilter';

const InventoryTagsOthersFilter = ({ options }) => {
  const dispatch = useDispatch();
  const saved = useSelector(selectInventoryTagsOthers);
  const [selected, setSelected] = useState(saved);

  return (
    <DropdownFilter
      label="Доп. теги"
      options={options ?? []}
      selected={selected}
      onChange={setSelected}
      onApply={(s) => dispatch(setInventoryTagsOthers(s))}
      onClose={() => setSelected(saved)}
      onReset={() => { setSelected([]); dispatch(resetInventoryTagsOthers()); }}
    />
  );
};

export default InventoryTagsOthersFilter;
