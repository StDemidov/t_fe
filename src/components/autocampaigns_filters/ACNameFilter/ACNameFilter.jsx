import { useDispatch, useSelector } from 'react-redux';
import {
  setAutoCmpgCampName,
  selectAutoCampCampNamFilter,
} from '../../../redux/slices/filterSlice';
import styles from './style.module.css';

const ACNameFilter = () => {
  const dispatch = useDispatch();
  const nameFilter = useSelector(selectAutoCampCampNamFilter);
  const handleVCNameFilterChange = (e) => {
    dispatch(setAutoCmpgCampName(e.target.value));
  };
  return (
    <div className={styles.VCNameFilter}>
      <input
        value={nameFilter}
        onChange={handleVCNameFilterChange}
        type="text"
        placeholder="Отфильтровать по названию..."
      />
    </div>
  );
};

export default ACNameFilter;
