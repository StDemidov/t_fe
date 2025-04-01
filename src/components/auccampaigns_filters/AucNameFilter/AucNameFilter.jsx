import { useDispatch, useSelector } from 'react-redux';
import {
  setAuсCmpgCampName,
  selectAucCampCampNameFilter,
} from '../../../redux/slices/filterSlice';
import styles from './style.module.css';

const AucNameFilter = () => {
  const dispatch = useDispatch();
  const nameFilter = useSelector(selectAucCampCampNameFilter);
  const handleVCNameFilterChange = (e) => {
    dispatch(setAuсCmpgCampName(e.target.value));
  };
  return (
    <div className={styles.VCNameFilter}>
      <input
        value={nameFilter}
        onChange={handleVCNameFilterChange}
        type="text"
        placeholder="Отфильтровать по названию или SKU..."
      />
    </div>
  );
};

export default AucNameFilter;
