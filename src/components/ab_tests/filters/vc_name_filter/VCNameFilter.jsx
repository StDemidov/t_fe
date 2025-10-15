import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { IoSearch } from 'react-icons/io5';

import {
  setABTestsActiveVCNameFilter,
  setABTestsCompletedVCNameFilter,
} from '../../../../redux/slices/filterSlice';
import styles from './style.module.css';

const VCNameFilter = ({ type }) => {
  const dispatch = useDispatch();
  const [nameFilter, setNameFilter] = useState('');
  const handleVCNameFilterChange = (e) => {
    setNameFilter(e.target.value);
  };
  const handleFindVC = (e) => {
    if (type === 'active') {
      dispatch(setABTestsActiveVCNameFilter(e.target.value));
    } else if (type === 'completed') {
      console.log(nameFilter);
      dispatch(setABTestsCompletedVCNameFilter(e.target.value));
    }
  };

  return (
    <div className={styles.searchBox}>
      <IoSearch />
      <input
        value={nameFilter}
        onChange={(e) => handleVCNameFilterChange(e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleFindVC(e);
          }
        }}
        type="text"
        placeholder="SKU или артикул"
        className={styles.searchInput}
      />
    </div>
  );
};

export default VCNameFilter;
