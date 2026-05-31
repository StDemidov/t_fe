import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styles from './style.module.css';
import DropdownFilter from './DropdownFilter';
import {
  resetFilterCategory,
  selectFilterCategory,
  setFilterCategory,
} from '../../../../redux/slices/campaignsSlice';

const CategoryFilter = ({ options }) => {
  const reduxSelectedOptions = useSelector(selectFilterCategory);
  const [localSelectedOptions, setLocalSelectedOptions] =
    useState(reduxSelectedOptions);
  const dispatch = useDispatch();

  // Синхронизируем локальное состояние с Redux
  useEffect(() => {
    setLocalSelectedOptions(reduxSelectedOptions);
  }, [reduxSelectedOptions]);

  const handleFilterApply = () => {
    // Сохраняем выбранные опции в Redux
    dispatch(setFilterCategory(localSelectedOptions));
  };

  const handleFilterReset = () => {
    setLocalSelectedOptions([]);
    dispatch(resetFilterCategory());
  };

  return (
    <>
      <DropdownFilter
        options={options}
        selectedOptions={localSelectedOptions}
        setSelectedOptions={setLocalSelectedOptions}
        handleFilterApply={handleFilterApply}
        handleFilterReset={handleFilterReset}
        title={'Категория'}
      />
    </>
  );
};

export default CategoryFilter;
