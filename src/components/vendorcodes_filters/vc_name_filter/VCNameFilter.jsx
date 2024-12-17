import { useDispatch, useSelector } from 'react-redux';
import {
  setVCNameFilter,
  selectVCNameFilter,
} from '../../../redux/slices/filterSlice';
import styles from './style.module.css';

const VCNameFilter = () => {
  const dispatch = useDispatch();
  const nameFilter = useSelector(selectVCNameFilter);
  const handleVCNameFilterChange = (e) => {
    dispatch(setVCNameFilter(e.target.value));
  };
  return (
    <div className={styles.VCNameFilter}>
      <input
        value={nameFilter}
        onChange={handleVCNameFilterChange}
        type="text"
        placeholder="Отфильтровать по артикулу или SKU..."
      />
    </div>
  );
};

export default VCNameFilter;
