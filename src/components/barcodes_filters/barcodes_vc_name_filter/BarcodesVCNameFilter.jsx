import { useDispatch, useSelector } from 'react-redux';
import {
  setBarcodesVCNameFilter,
  selectBarcodeVCNameFilter,
} from '../../../redux/slices/filterSlice';
import styles from './style.module.css';
import { useState } from 'react';

const BarcodesVCNameFilter = () => {
  const dispatch = useDispatch();
  const [nameFilter, setNameFilter] = useState('');
  // const nameFilter = useSelector(selectBarcodeVCNameFilter);
  const handleVCNameFilterChange = (e) => {
    setNameFilter(e.target.value);
  };
  const handleFindVC = (e) => {
    dispatch(setBarcodesVCNameFilter(e.target.value));
  };

  return (
    <div className={styles.VCNameFilter}>
      <input
        value={nameFilter}
        onChange={(e) => handleVCNameFilterChange(e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleFindVC(e);
          }
        }}
        type="text"
        placeholder="Отфильтровать по артикулу или SKU..."
      />
    </div>
  );
};

export default BarcodesVCNameFilter;
