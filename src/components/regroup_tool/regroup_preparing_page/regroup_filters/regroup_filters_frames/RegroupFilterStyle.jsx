import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetRegroupFilterStyle,
  selectRegroupFilterStyle,
  setRegroupFilterStyle,
} from '../../../../../redux/slices/regroupSlice';
import DropdownFilter from '../../../../dropdown_filter/DropdownFilter';

const RegroupFilterStyle = ({ options }) => {
  const reduxSelectedOptions = useSelector(selectRegroupFilterStyle);
  const [localSelectedOptions, setLocalSelectedOptions] =
    useState(reduxSelectedOptions);
  const dispatch = useDispatch();

  useEffect(() => {
    setLocalSelectedOptions(reduxSelectedOptions);
  }, [reduxSelectedOptions]);

  const handleFilterApply = () => {
    dispatch(setRegroupFilterStyle(localSelectedOptions));
  };

  const handleFilterReset = () => {
    setLocalSelectedOptions([]);
    dispatch(resetRegroupFilterStyle());
  };
  return (
    <>
      <DropdownFilter
        options={options}
        selectedOptions={localSelectedOptions}
        setSelectedOptions={setLocalSelectedOptions}
        handleFilterApply={handleFilterApply}
        handleFilterReset={handleFilterReset}
        title={reduxSelectedOptions !== '' ? reduxSelectedOptions : 'Стиль'}
        searchable={true}
        singleChoice={true}
      />
    </>
  );
};

export default RegroupFilterStyle;
