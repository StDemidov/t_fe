import { useSelector } from 'react-redux';

import VCCategoryFilter from './category_filter/VCCategoryFilter';
import { selectVendorCodeMetrics } from '../../redux/slices/vendorCodeSlice';

import styles from './style.module.css';
import VCNameFilter from './vc_name_filter/VCNameFilter';
import VCAbcFilter from './abc_filter/VCAbcFilter';
import DateFilter from './date_filter/dateFilter';
import VCSorting from './sorting/VCSorting';

const VendorCodesFilters = () => {
  const vendorCodesWMetrics = useSelector(selectVendorCodeMetrics);

  let categories = vendorCodesWMetrics.map((vendorcode) => {
    return vendorcode.categoryName;
  });

  let abc = vendorCodesWMetrics.map((vendorcode) => {
    return vendorcode.abcCurrent;
  });

  categories = [...new Set(categories)];
  abc = [...new Set(abc)];

  return (
    <div className={styles.filterSection}>
      <DateFilter />
      <VCCategoryFilter options={categories} />
      <VCAbcFilter options={abc} />
      <VCSorting />
      <VCNameFilter />
    </div>
  );
};

export default VendorCodesFilters;
