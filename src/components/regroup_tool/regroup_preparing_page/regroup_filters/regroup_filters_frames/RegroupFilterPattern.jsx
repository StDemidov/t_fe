import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetRegroupFilterPatterns,
  selectRegroupFilterPatterns,
  setRegroupFilterPatterns,
} from '../../../../../redux/slices/regroupSlice';
import DropdownFilter from '../../../../dropdown_filter/DropdownFilter';

const RegroupFilterPattern = ({ options }) => {
  const reduxSelectedOptions = useSelector(selectRegroupFilterPatterns);
  const [localSelectedOptions, setLocalSelectedOptions] =
    useState(reduxSelectedOptions);
  const dispatch = useDispatch();

  useEffect(() => {
    setLocalSelectedOptions(reduxSelectedOptions);
  }, [reduxSelectedOptions]);

  const handleFilterApply = () => {
    dispatch(setRegroupFilterPatterns(localSelectedOptions));
  };

  const handleFilterReset = () => {
    setLocalSelectedOptions([]);
    dispatch(resetRegroupFilterPatterns());
  };
  return (
    <>
      <DropdownFilter
        options={options}
        selectedOptions={localSelectedOptions}
        setSelectedOptions={setLocalSelectedOptions}
        handleFilterApply={handleFilterApply}
        handleFilterReset={handleFilterReset}
        title={'Лекало'}
        searchable={true}
      />
    </>
  );
};

export default RegroupFilterPattern;
