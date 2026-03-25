import { useDispatch } from 'react-redux';
import { setBarcodeOrderNameFilter } from '../../../redux/slices/filterSlice';
import styles from './style.module.css';
import { useState } from 'react';

const BarcodesOrderNameFilter = () => {
  const dispatch = useDispatch();
  const [orderNameFilter, setOrderNameFilter] = useState('');
  const handleOrderNameFilterChange = (e) => {
    setOrderNameFilter(e.target.value);
  };
  const handleFindVC = (e) => {
    dispatch(setBarcodeOrderNameFilter(e.target.value));
  };

  return (
    <div className={styles.VCNameFilter}>
      <input
        value={orderNameFilter}
        onChange={(e) => handleOrderNameFilterChange(e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleFindVC(e);
          }
        }}
        type="text"
        placeholder="Заказ..."
      />
    </div>
  );
};

export default BarcodesOrderNameFilter;
