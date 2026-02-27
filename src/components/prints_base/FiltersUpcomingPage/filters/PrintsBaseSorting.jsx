import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DropdownFilter from './DropdownFilter';
import {
  resetOrdersSortingType,
  resetSortingType,
  selectOrdersSortingType,
  selectUpcomingSortingType,
  setOrdersSortingType,
  setSortingType,
} from '../../../../redux/slices/basePrints';

const PrintsBaseSorting = ({ forOrders = false }) => {
  const options = [
    { key: 'От новых к стырым', name: 'От новых к стырым' },
    { key: 'От старых к новым', name: 'От старых к новым' },
  ];
  let reduxSelectedOptions = useSelector(selectUpcomingSortingType);
  if (forOrders) {
    reduxSelectedOptions = useSelector(selectOrdersSortingType);
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
      dispatch(setOrdersSortingType(localSelectedOptions));
    } else {
      dispatch(setSortingType(localSelectedOptions));
    }
  };

  const handleFilterReset = () => {
    setLocalSelectedOptions('От старых к новым');
    dispatch(resetSortingType());
    if (forOrders) {
      dispatch(resetOrdersSortingType);
    } else {
      dispatch(resetSortingType());
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
        title={reduxSelectedOptions}
        sorting={true}
      />
    </>
  );
};

export default PrintsBaseSorting;
