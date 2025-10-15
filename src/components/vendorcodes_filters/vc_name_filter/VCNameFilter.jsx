import { useDispatch } from 'react-redux';
import { setVCNameFilter } from '../../../redux/slices/filterSlice';
import styles from './style.module.css';
import { useState } from 'react';

const VCNameFilter = () => {
  const dispatch = useDispatch();
  const [nameFilter, setNameFilter] = useState('');
  const handleVCNameFilterChange = (e) => {
    setNameFilter(e.target.value);
  };
  const handleFindVC = (e) => {
    dispatch(setVCNameFilter(e.target.value));
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

export default VCNameFilter;
