import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetRegroupFilterCategory,
  resetRegroupFilterPatterns,
  resetRegroupFilterStyle,
  selectRegroupFilterCategory,
  setRegroupFilterCategory,
} from '../../../../../redux/slices/regroupSlice';
import DropdownFilter from '../../../../dropdown_filter/DropdownFilter';

const RegroupFilterCategory = ({ options }) => {
  const reduxSelectedOptions = useSelector(selectRegroupFilterCategory);
  const [localSelectedOptions, setLocalSelectedOptions] =
    useState(reduxSelectedOptions);
  const dispatch = useDispatch();

  useEffect(() => {
    setLocalSelectedOptions(reduxSelectedOptions);
    if (reduxSelectedOptions !== '') {
      dispatch(resetRegroupFilterPatterns());
      dispatch(resetRegroupFilterStyle());
    }
  }, [reduxSelectedOptions, dispatch]);

  const handleFilterApply = () => {
    dispatch(setRegroupFilterCategory(localSelectedOptions));
  };

  const handleFilterReset = () => {
    setLocalSelectedOptions([]);
    dispatch(resetRegroupFilterCategory());
  };
  return (
    <>
      <DropdownFilter
        options={options}
        selectedOptions={localSelectedOptions}
        setSelectedOptions={setLocalSelectedOptions}
        handleFilterApply={handleFilterApply}
        handleFilterReset={handleFilterReset}
        title={reduxSelectedOptions !== '' ? reduxSelectedOptions : 'Категория'}
        searchable={true}
        singleChoice={true}
      />
    </>
  );
};

export default RegroupFilterCategory;
