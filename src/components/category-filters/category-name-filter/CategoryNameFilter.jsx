import { useDispatch, useSelector } from 'react-redux';
import {
  setCategoryNameFilter,
  selectCategoryNameFilter,
} from '../../../redux/slices/filterSlice';
import styles from './style.module.css';

const CategoryNameFilter = () => {
  const dispatch = useDispatch();
  const nameFilter = useSelector(selectCategoryNameFilter);
  const handleCategoryNameFilterChange = (e) => {
    dispatch(setCategoryNameFilter(e.target.value));
  };
  return (
    <div className={styles.VCNameFilter}>
      <input
        value={nameFilter}
        onChange={handleCategoryNameFilterChange}
        type="text"
        placeholder="Отфильтровать по названию..."
      />
    </div>
  );
};

export default CategoryNameFilter;
