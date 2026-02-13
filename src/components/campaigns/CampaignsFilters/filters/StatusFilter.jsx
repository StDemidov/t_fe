import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styles from './style.module.css';
import DropdownFilter from './DropdownFilter';
import {
  resetFilterStatus,
  selectFilterStatus,
  setFilterStatus,
} from '../../../../redux/slices/campaignsSlice';

const StatusFilter = ({ options }) => {
  const reduxSelectedOptions = useSelector(selectFilterStatus);
  const [localSelectedOptions, setLocalSelectedOptions] =
    useState(reduxSelectedOptions);
  const dispatch = useDispatch();

  // Синхронизируем локальное состояние с Redux
  useEffect(() => {
    setLocalSelectedOptions(reduxSelectedOptions);
  }, [reduxSelectedOptions]);

  const handleFilterApply = () => {
    // Сохраняем выбранные опции в Redux
    let numbers = localSelectedOptions.map(Number);
    dispatch(setFilterStatus(numbers));
  };

  const handleFilterReset = () => {
    setLocalSelectedOptions([]);
    dispatch(resetFilterStatus());
  };

  return (
    <>
      <DropdownFilter
        options={options}
        selectedOptions={localSelectedOptions}
        setSelectedOptions={setLocalSelectedOptions}
        handleFilterApply={handleFilterApply}
        handleFilterReset={handleFilterReset}
        title={'Статус'}
      />
    </>
  );
};

export default StatusFilter;
