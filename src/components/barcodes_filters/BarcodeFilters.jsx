import { useSelector } from 'react-redux';

import { selectBarcodes } from '../../redux/slices/barcodeSlice';

import BarcodesDateFilter from './barcodes-date-filter/BarcodesDateFilter';
import BarcodesSorting from './barcodes_sorting/BarcodesSorting';

import styles from './style.module.css';
import BarcodesVCNameFilter from './barcodes_vc_name_filter/BarcodesVCNameFilter';
import BarcodesColorFilter from './barcodes_color_filter/BarcodesColorFilter';

const BarcodeFilters = () => {
  // const barcodes = useSelector(selectBarcodes);

  return (
    <div className={styles.filterSection}>
      <BarcodesDateFilter />
      <BarcodesSorting />
      <BarcodesColorFilter />
      <BarcodesVCNameFilter />
    </div>
  );
};

export default BarcodeFilters;
