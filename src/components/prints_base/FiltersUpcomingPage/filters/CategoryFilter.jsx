import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styles from './style.module.css';
import DropdownFilter from './DropdownFilter';
import {
  resetFilterCategory,
  resetFilterPattern,
  resetOrdersFilterCategory,
  resetOrdersFilterPattern,
  selectOrdersCategoryFilter,
  selectUpcomingCategoryFilter,
  setFilterCategory,
  setOrdersFilterCategory,
} from '../../../../redux/slices/basePrints';

const CategoryFilter = ({ options, forOrders = false }) => {
  let reduxSelectedOptions = useSelector(selectUpcomingCategoryFilter);
  if (forOrders) {
    reduxSelectedOptions = useSelector(selectOrdersCategoryFilter);
  }
  const [localSelectedOptions, setLocalSelectedOptions] =
    useState(reduxSelectedOptions);
  const dispatch = useDispatch();

  // Синхронизируем локальное состояние с Redux
  useEffect(() => {
    setLocalSelectedOptions(reduxSelectedOptions);
  }, [reduxSelectedOptions]);

  const handleFilterApply = () => {
    // Сохраняем выбранные опции в Redux

    if (forOrders) {
      dispatch(resetOrdersFilterPattern());
      dispatch(setOrdersFilterCategory(localSelectedOptions));
    } else {
      dispatch(resetFilterPattern());
      dispatch(setFilterCategory(localSelectedOptions));
    }
  };

  const handleFilterReset = () => {
    setLocalSelectedOptions([]);
    dispatch(resetSortingType());
    if (forOrders) {
      dispatch(resetOrdersFilterCategory);
    } else {
      dispatch(resetFilterCategory());
    }
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
