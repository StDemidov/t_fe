import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styles from './style.module.css';
import DropdownFilter from './DropdownFilter';
import {
  resetFilterCountry,
  resetOrdersFilterCountry,
  selectOrdersCountryFilter,
  selectUpcomingCountryFilter,
  setFilterCountry,
  setOrdersFilterCountry,
} from '../../../../redux/slices/basePrints';

const CountryFilter = ({ options, forOrders = false }) => {
  let reduxSelectedOptions = useSelector(selectUpcomingCountryFilter);
  if (forOrders) {
    reduxSelectedOptions = useSelector(selectOrdersCountryFilter);
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
    dispatch(setFilterCountry(localSelectedOptions));
    if (forOrders) {
      dispatch(setOrdersFilterCountry(localSelectedOptions));
    } else {
      dispatch(setFilterCountry(localSelectedOptions));
    }
  };

  const handleFilterReset = () => {
    setLocalSelectedOptions([]);
    dispatch(resetFilterCountry());
    if (forOrders) {
      dispatch(resetOrdersFilterCountry());
    } else {
      dispatch(resetFilterCountry());
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
        title={'Страна'}
        searchable={true}
      />
    </>
  );
};

export default CountryFilter;
