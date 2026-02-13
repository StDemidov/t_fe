import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styles from './style.module.css';
import DropdownFilter from './DropdownFilter';
import {
  resetSortingType,
  selectSortingType,
  setSortingType,
} from '../../../../redux/slices/campaignsSlice';

const CampaignsSorting = () => {
  const options = [
    { key: 'Дата создания ↑', name: 'Дата создания ↑' },
    { key: 'Дата создания ↓', name: 'Дата создания ↓' },
    { key: 'Показы ↑', name: 'Показы ↑' },
    { key: 'Показы ↓', name: 'Показы ↓' },
    { key: 'Траты ↑', name: 'Траты ↑' },
    { key: 'Траты ↓', name: 'Траты ↓' },
    { key: 'Полные затраты ↑', name: 'Полные затраты ↑' },
    { key: 'Полные затраты ↓', name: 'Полные затраты ↓' },
    { key: 'CTR ↑', name: 'CTR ↑' },
    { key: 'CTR ↓', name: 'CTR ↓' },
    { key: 'Полный CTR ↑', name: 'Полный CTR ↑' },
    { key: 'Полный CTR ↓', name: 'Полный CTR ↓' },
  ];
  const reduxSelectedOptions = useSelector(selectSortingType);
  const [localSelectedOptions, setLocalSelectedOptions] =
    useState(reduxSelectedOptions);
  const dispatch = useDispatch();

  // Синхронизируем локальное состояние с Redux
  useEffect(() => {
    setLocalSelectedOptions(reduxSelectedOptions);
  }, [reduxSelectedOptions]);

  const handleFilterApply = () => {
    // Сохраняем выбранные опции в Redux
    dispatch(setSortingType(localSelectedOptions));
  };

  const handleFilterReset = () => {
    setLocalSelectedOptions('Дата создания ↑');
    dispatch(resetSortingType());
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

export default CampaignsSorting;
