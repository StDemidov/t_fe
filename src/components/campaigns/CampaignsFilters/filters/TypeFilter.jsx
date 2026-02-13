import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styles from './style.module.css';
import DropdownFilter from './DropdownFilter';
import {
  resetFilterType,
  selectFilterType,
  setFilterType,
} from '../../../../redux/slices/campaignsSlice';

const TypeFilter = ({ options }) => {
  const reduxSelectedOptions = useSelector(selectFilterType);
  const [localSelectedOptions, setLocalSelectedOptions] =
    useState(reduxSelectedOptions);
  const dispatch = useDispatch();

  // Синхронизируем локальное состояние с Redux
  useEffect(() => {
    setLocalSelectedOptions(reduxSelectedOptions);
  }, [reduxSelectedOptions]);

  const handleFilterApply = () => {
    // Сохраняем выбранные опции в Redux;
    dispatch(setFilterType(localSelectedOptions));
  };

  const handleFilterReset = () => {
    setLocalSelectedOptions([]);
    dispatch(resetFilterType());
  };

  return (
    <>
      <DropdownFilter
        options={options}
        selectedOptions={localSelectedOptions}
        setSelectedOptions={setLocalSelectedOptions}
        handleFilterApply={handleFilterApply}
        handleFilterReset={handleFilterReset}
        title={'Тип кампании'}
      />
    </>
  );
};

export default TypeFilter;
