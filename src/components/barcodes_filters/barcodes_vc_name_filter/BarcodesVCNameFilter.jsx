import { useDispatch, useSelector } from 'react-redux';
import {
  setBarcodesVCNameFilter,
  selectBarcodeVCNameFilter,
} from '../../../redux/slices/filterSlice';
import styles from './style.module.css';

const BarcodesVCNameFilter = () => {
  const dispatch = useDispatch();
  const nameFilter = useSelector(selectBarcodeVCNameFilter);
  const handleVCNameFilterChange = (e) => {
    dispatch(setBarcodesVCNameFilter(e.target.value));
  };
  return (
    <div className={styles.VCNameFilter}>
      <input
        value={nameFilter}
        onChange={handleVCNameFilterChange}
        type="text"
        placeholder="Отфильтровать по артикулу..."
      />
    </div>
  );
};

export default BarcodesVCNameFilter;
