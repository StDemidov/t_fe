import { FaSpinner } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSpring, animated } from '@react-spring/web';

import {
  fetchBarcodes,
  selectBarcodes,
  selectIsLoading,
  selectOrders,
  selectPage,
  setPageBarcode,
} from '../../redux/slices/barcodeSlice';

import { hostName } from '../../utils/host';
import { selectNotificationMessage } from '../../redux/slices/notificationSlice';

import BarcodesTableNew from '../barcodes_table_new/BarcodesTableNew';
import {
  selectBarcodeColorFilter,
  selectBarcodeDatesFilter,
  selectBarcodeSortingType,
  selectBarcodeTagsClothFilter,
  selectBarcodeTagsFilter,
  selectBarcodeTagsOthersFilter,
  selectBarcodeVCNameFilter,
  selectBarcodeCategoryFilter,
  selectBarcodeDeadline,
} from '../../redux/slices/filterSlice';
import { getSum, getAverage } from '../../utils/dataSlicing';
import { calculateCostPerOrder } from '../../utils/calculations';
import { selectColors } from '../../redux/slices/ordersSlice';

const BarcodesListNew = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const barcodes = useSelector(selectBarcodes);
  const orders = useSelector(selectOrders);
  const notificationMessage = useSelector(selectNotificationMessage);
  const currentPage = useSelector(selectPage);
  const datesFilter = useSelector(selectBarcodeDatesFilter);
  const selectedSorting = useSelector(selectBarcodeSortingType);
  const vcNameFilter = useSelector(selectBarcodeVCNameFilter);
  const colorFilter = useSelector(selectBarcodeColorFilter);
  const tagFilter = useSelector(selectBarcodeTagsFilter);
  const tagClothFilter = useSelector(selectBarcodeTagsClothFilter);
  const tagOthersFilter = useSelector(selectBarcodeTagsOthersFilter);
  const categoryFilter = useSelector(selectBarcodeCategoryFilter);
  const savedColors = useSelector(selectColors);
  const [selectedColors, setSelectedColors] = useState(savedColors);
  const startDate = new Date(datesFilter.start);
  const endDate = new Date(datesFilter.end);
  const deadline = useSelector(selectBarcodeDeadline);

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

  const extentedBarcodes = structuredClone(barcodes);
  extentedBarcodes.map((item) => {
    item.ordersSum = getSum(item.orders, startDate, endDate);
    item.ebitda = getAverage(item.ebitda, startDate, endDate);
    item.ebitdaDaily = getAverage(item.ebitdaDaily, startDate, endDate);
    item.cpo = calculateCostPerOrder(item.orders, item.adsCosts);
  });

  const filteredBarcodes = extentedBarcodes.filter((vc) => {
    let vcNameMatch = true;
    let colorMatch = true;
    let tagMatch = true;
    let tagClothMatch = true;
    let tagOthersMatch = true;
    let categoryMatch = true;

    if (vcNameFilter.length !== 0) {
      if (isNaN(vcNameFilter)) {
        vcNameMatch = vc.vcName
          .toLowerCase()
          .includes(vcNameFilter.toLowerCase());
      } else {
        vcNameMatch = vc.sku.toLowerCase().includes(vcNameFilter);
      }
    }
    if (colorFilter.length !== 0) {
      colorMatch = colorFilter.includes(selectedColors[vc.vcName]);
    }
    if (tagFilter.length !== 0) {
      tagMatch = includesAny(tagFilter, vc.tagsMain);
    }
    if (tagClothFilter.length !== 0) {
      tagClothMatch = includesAny(tagClothFilter, vc.tagsCloth);
    }
    if (tagOthersFilter.length !== 0) {
      tagOthersMatch = includesAny(tagOthersFilter, vc.tagsOthers);
    }
    if (categoryFilter.length !== 0) {
      categoryMatch = categoryFilter.includes(vc.category);
    }
    return (
      vcNameMatch &&
      colorMatch &&
      tagMatch &&
      tagClothMatch &&
      tagOthersMatch &&
      categoryMatch
    );
  });

  getSortedData(filteredBarcodes, selectedSorting);

  const barcodes_splitted = splitArray(filteredBarcodes);

  return (
    <>
      {isLoading || barcodes_splitted.length === 0 ? (
        <FaSpinner className="spinner" />
      ) : (
        <animated.div style={{ ...animStyles }}>
          <section>
            <BarcodesTableNew
              rawData={extentedBarcodes}
              fullData={filteredBarcodes}
              data={
                currentPage > barcodes_splitted.length
                  ? barcodes_splitted[0]
                  : barcodes_splitted[currentPage - 1]
              }
              endDate={deadline}
              orders={orders}
              pagesNumber={barcodes_splitted.length}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
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
  if (result.length === 0) {
    return [[]];
  }
  return result;
}

const getSortedData = (data, selectedSorting) => {
  switch (selectedSorting) {
    case 'EBITDA (сред) ↓':
      data.sort((a, b) => (a.ebitda > b.ebitda ? -1 : 1));
      break;
    case 'EBITDA (сред) ↑':
      data.sort((a, b) => (a.ebitda > b.ebitda ? 1 : -1));
      break;
    case 'EBITDA/день (сред) ↓':
      data.sort((a, b) => (a.ebitdaDaily > b.ebitdaDaily ? -1 : 1));
      break;
    case 'EBITDA/день (сред) ↑':
      data.sort((a, b) => (a.ebitdaDaily > b.ebitdaDaily ? 1 : -1));
      break;
    case 'Заказы ↓':
      data.sort((a, b) => (a.ordersSum > b.ordersSum ? -1 : 1));
      break;
    case 'Заказы ↑':
      data.sort((a, b) => (a.ordersSum > b.ordersSum ? 1 : -1));
      break;
    case 'От новых к старым':
      data.sort((a, b) => (a.startDate > b.startDate ? -1 : 1));
      break;
    case 'От старых к новым':
      data.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
      break;
    default:
      data.sort((a, b) => (a.ebitda > b.ebitda ? -1 : 1));
  }
};

const includesAny = (arr, values) => values.some((v) => arr.includes(v));
