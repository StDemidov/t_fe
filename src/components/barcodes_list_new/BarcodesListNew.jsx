import { FaSpinner } from 'react-icons/fa';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSpring, animated } from '@react-spring/web';

import {
  fetchBarcodes,
  selectBarcodes,
  selectIsLoading,
  selectOrders,
  selectPage,
} from '../../redux/slices/barcodeSlice';

import { hostName } from '../../utils/host';
import { selectNotificationMessage } from '../../redux/slices/notificationSlice';

import BarcodesTableNew from '../barcodes_table_new/BarcodesTableNew';
import { selectBarcodeDatesFilter } from '../../redux/slices/filterSlice';
import { getSum } from '../../utils/dataSlicing';

const BarcodesListNew = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const barcodes = useSelector(selectBarcodes);
  const orders = useSelector(selectOrders);
  const notificationMessage = useSelector(selectNotificationMessage);
  const currentPage = useSelector(selectPage);
  const datesFilter = useSelector(selectBarcodeDatesFilter);
  const startDate = new Date(datesFilter.start);
  const endDate = new Date(datesFilter.end);

  const animStyles = useSpring({
    loop: false,
    from: { opacity: '0' },
    to: { opacity: '1' },
    config: { duration: '600' },
  });

  useEffect(() => {
    if (notificationMessage === '') {
      dispatch(fetchBarcodes(`${hostName}/barcode/get_bc_stats_w_preds`));
    }
  }, [notificationMessage]);

  const deadline = '2025-07-31';

  const extentedBarcodes = structuredClone(barcodes);
  extentedBarcodes.map((item) => {
    item.ordersSum = getSum(item.orders, startDate, endDate);
  });

  const barcodes_splitted = splitArray(extentedBarcodes);

  return (
    <>
      {isLoading || barcodes_splitted.length === 0 ? (
        <FaSpinner className="spinner" />
      ) : (
        <animated.div style={{ ...animStyles }}>
          <section>
            <BarcodesTableNew
              data={barcodes_splitted[currentPage - 1]}
              endDate={deadline}
              orders={orders}
              pagesNumber={barcodes_splitted.length}
            />
          </section>
        </animated.div>
      )}
    </>
  );
};

export default BarcodesListNew;

function splitArray(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i += 50) {
    result.push(arr.slice(i, i + 50));
  }
  return result;
}
