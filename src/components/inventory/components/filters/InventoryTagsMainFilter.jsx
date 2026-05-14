import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setInventoryTagsMain, resetInventoryTagsMain, selectInventoryTagsMain,
} from '../../redux/inventoryFilterSlice';
import DropdownFilter from './_DropdownFilter';

const InventoryTagsMainFilter = ({ options }) => {
  const dispatch = useDispatch();
  const saved = useSelector(selectInventoryTagsMain);
  const [selected, setSelected] = useState(saved);

  return (
    <DropdownFilter
      label="Теги"
      options={options ?? []}
      selected={selected}
      onChange={setSelected}
      onApply={(s) => dispatch(setInventoryTagsMain(s))}
      onClose={() => setSelected(saved)}
      onReset={() => { setSelected([]); dispatch(resetInventoryTagsMain()); }}
    />
  );
};

export default InventoryTagsMainFilter;
