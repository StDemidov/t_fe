import { useSelector } from 'react-redux';

import { selectBarcodes } from '../../redux/slices/barcodeSlice';

import BarcodesDateFilter from './barcodes-date-filter/BarcodesDateFilter';
import BarcodesSorting from './barcodes_sorting/BarcodesSorting';

import styles from './style.module.css';
import BarcodesVCNameFilter from './barcodes_vc_name_filter/BarcodesVCNameFilter';
import BarcodesColorFilter from './barcodes_color_filter/BarcodesColorFilter';
import BarcodeTagClothFilter from './barcode_tag_filter_cloth/BarcodeTagClothFilter';
import BarcodeTagFilter from './barcode_tag_filter/BarcodeTagFilter';
import BarcodeTagOthersFilter from './barcode_tag_filter_others/BarcodeTagOthersFilter';
import BarcodeCategoryFilter from './barcode_category_filter/BarcodeCategoryFilter';

const BarcodeFilters = ({ tagsMain, tagsCloth, tagsOthers, categories }) => {
  // const barcodes = useSelector(selectBarcodes);

  return (
    <div>
      <div className={styles.filterSection}>
        <BarcodesDateFilter />
        <BarcodesSorting />
        <BarcodeCategoryFilter options={categories} />

        <BarcodesColorFilter />

        <BarcodeTagFilter options={tagsMain} />
        <BarcodeTagClothFilter options={tagsCloth} />
        <BarcodeTagOthersFilter options={tagsOthers} />
        <BarcodesVCNameFilter />
      </div>
    </div>
  );
};

export default BarcodeFilters;
