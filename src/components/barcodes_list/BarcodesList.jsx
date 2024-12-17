import { FaSpinner } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';

import {
  fetchBarcodes,
  selectBarcodes,
  selectIsLoading,
} from '../../redux/slices/barcodeSlice';
import BarcodesTable from '../barcodes_table/BarcodesTable';
import BarcodeFilters from '../barcodes_filters/BarcodeFilters';
import { selectBarcodeCategoryFilter } from '../../redux/slices/filterSlice';
import { hostName } from '../../utils/host';

const BarcodesList = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const barcodes = useSelector(selectBarcodes);
  const categoryFilter = useSelector(selectBarcodeCategoryFilter);

  const animStyles = useSpring({
    loop: false,
    from: { opacity: '0' },
    to: { opacity: '1' },
    config: { duration: '600' },
  });

  useEffect(() => {
    dispatch(fetchBarcodes(`${hostName}/barcode/`));
  }, [barcodes.length, dispatch]);

  const filterSetted = categoryFilter.length !== 0 ? true : false;

  const filteredBarcodes = Object.fromEntries(
    Object.entries(barcodes).filter(([key, value]) => {
      return categoryFilter.includes(value.category.name);
    })
  );

  return (
    <>
      {isLoading ? (
        <FaSpinner className="spinner" />
      ) : (
        <animated.div style={{ ...animStyles }}>
          <section>
            <h1>Данные по баркодам</h1>
            <BarcodeFilters />
            <BarcodesTable
              barcodes={filterSetted ? filteredBarcodes : barcodes}
            />
          </section>
        </animated.div>
      )}
    </>
  );
};

export default BarcodesList;
