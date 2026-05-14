import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setInventoryTagsCloth, resetInventoryTagsCloth, selectInventoryTagsCloth,
} from '../../redux/inventoryFilterSlice';
import DropdownFilter from './_DropdownFilter';

const InventoryTagsClothFilter = ({ options }) => {
  const dispatch = useDispatch();
  const saved = useSelector(selectInventoryTagsCloth);
  const [selected, setSelected] = useState(saved);

  return (
    <DropdownFilter
      label="Ткань"
      options={options ?? []}
      selected={selected}
      onChange={setSelected}
      onApply={(s) => dispatch(setInventoryTagsCloth(s))}
      onClose={() => setSelected(saved)}
      onReset={() => { setSelected([]); dispatch(resetInventoryTagsCloth()); }}
    />
  );
};

export default InventoryTagsClothFilter;
