import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styles from './style.module.css';
import DropdownFilter from './DropdownFilter';
import {
  resetFilterPattern,
  resetOrdersFilterPattern,
  selectOrdersPatternFilter,
  selectUpcomingPatternFilter,
  setFilterPattern,
  setOrdersFilterPattern,
} from '../../../../redux/slices/basePrints';

const PatternFilter = ({ options, forOrders = false }) => {
  let reduxSelectedOptions = useSelector(selectUpcomingPatternFilter);
  if (forOrders) {
    reduxSelectedOptions = useSelector(selectOrdersPatternFilter);
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
    dispatch(setFilterPattern(localSelectedOptions));
    if (forOrders) {
      dispatch(setOrdersFilterPattern(localSelectedOptions));
    } else {
      dispatch(setFilterPattern(localSelectedOptions));
    }
  };

  const handleFilterReset = () => {
    setLocalSelectedOptions([]);
    dispatch(resetFilterPattern());
    if (forOrders) {
      dispatch(resetOrdersFilterPattern());
    } else {
      dispatch(resetFilterPattern());
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
        title={'Лекала'}
      />
    </>
  );
};

export default PatternFilter;
