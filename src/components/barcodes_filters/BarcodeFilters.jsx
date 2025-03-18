import { useSelector } from 'react-redux';

import { selectBarcodes } from '../../redux/slices/barcodeSlice';

import BarcodesDateFilter from './barcodes-date-filter/BarcodesDateFilter';

const BarcodeFilters = () => {
  // const barcodes = useSelector(selectBarcodes);

  return (
    <>
      <BarcodesDateFilter />
    </>
  );
};

export default BarcodeFilters;
