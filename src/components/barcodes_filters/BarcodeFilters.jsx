import { useSelector } from 'react-redux';

import CategoryFilter from './category_filter/CategoryFilter';
import { selectBarcodes } from '../../redux/slices/barcodeSlice';

import styles from './style.module.css';
import BarcodesDateFilter from './barcodes-date-filter/BarcodesDateFilter';

const BarcodeFilters = () => {
  const barcodes = useSelector(selectBarcodes);

  let categories = Object.keys(barcodes).map((vendorcode) => {
    return barcodes[vendorcode]['category'].name;
  });

  categories = [...new Set(categories)];

  return (
    <div className={styles.filterSection}>
      <BarcodesDateFilter />
      <CategoryFilter options={categories} />
    </div>
  );
};

export default BarcodeFilters;
