import { useDispatch, useSelector } from 'react-redux';
import {
  resetSkuOrNameTasksFilter,
  selectSkuOrNameTasksFilter,
  setSkuOrNameTasksFilter,
} from '../../../redux/slices/filterSlice';

import styles from './style.module.css';

const SkuNameFilter = () => {
  const dispatch = useDispatch();
  const nameFilter = useSelector(selectSkuOrNameTasksFilter);
  const handleVCNameFilterChange = (e) => {
    dispatch(setSkuOrNameTasksFilter(e.target.value));
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

export default SkuNameFilter;
