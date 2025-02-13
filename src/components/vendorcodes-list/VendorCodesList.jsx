import { FaSpinner } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';

import {
  fetchVendorCodeMetrics,
  selectVendorCodeMetrics,
  selectIsLoading,
  selectTagsIsLoading,
} from '../../redux/slices/vendorCodeSlice';
import VendorCodesTable from '../vendorcodes-table/VendorCodesTable';
import VendorCodesFilters from '../vendorcodes_filters/VendorCodesFilters';
import {
  selectVendorCodeAbcFilter,
  selectVendorCodeCategoryFilter,
  selectVCNameFilter,
  selectVCDatesFilter,
  selectVCSortingType,
  selectVCTagsFilter,
} from '../../redux/slices/filterSlice';
import { fetchAvailableTags } from '../../redux/slices/vendorCodeSlice';
import { hostName } from '../../utils/host';
import { selectNotificationMessage } from '../../redux/slices/notificationSlice';

import {
  getDataForPeriod,
  getSum,
  getSumRaw,
  getAverage,
} from '../../utils/dataSlicing';
import { calculateCostPerOrder } from '../../utils/calculations';

const VendorCodesList = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const tagsIsLoading = useSelector(selectTagsIsLoading);
  const vendorCodesWMetrics = useSelector(selectVendorCodeMetrics);
  const categoryFilter = useSelector(selectVendorCodeCategoryFilter);
  const VCNameFilter = useSelector(selectVCNameFilter);
  const abcFilter = useSelector(selectVendorCodeAbcFilter);
  const dateFilter = useSelector(selectVCDatesFilter);
  const tagsFilter = useSelector(selectVCTagsFilter);
  const startDate = new Date(dateFilter.start);
  const endDate = new Date(dateFilter.end);
  const notificationMessage = useSelector(selectNotificationMessage);

  const selectedSorting = useSelector(selectVCSortingType);

  const animStyles = useSpring({
    loop: false,
    from: { opacity: '0' },
    to: { opacity: '1' },
    config: { duration: '600' },
  });

  useEffect(() => {
    if (notificationMessage === '') {
      dispatch(fetchVendorCodeMetrics(`${hostName}/vendorcode/`));
      dispatch(fetchAvailableTags(`${hostName}/tags/all_tags`));
    }
  }, [dispatch, notificationMessage]);

  const includesAny = (arr, values) => values.some((v) => arr.includes(v));

  const filteredVCMetrics = vendorCodesWMetrics.filter((vc) => {
    let categoryMatch = true;
    let vcNameMatch = true;
    let abcMatch = true;
    let tagMatch = true;
    if (categoryFilter.length !== 0) {
      categoryMatch = categoryFilter.includes(vc.categoryName);
    }
    if (VCNameFilter.length !== 0) {
      if (isNaN(VCNameFilter)) {
        vcNameMatch = vc.vendorCode
          .toLowerCase()
          .includes(VCNameFilter.toLowerCase());
      } else {
        vcNameMatch = vc.sku.toLowerCase().includes(VCNameFilter);
      }
    }
    if (abcFilter.length !== 0) {
      abcMatch = abcFilter.includes(vc.abcCurrent);
    }
    if (tagsFilter.length !== 0) {
      tagMatch = includesAny(tagsFilter, vc.tags);
    }
    return categoryMatch && vcNameMatch && abcMatch && tagMatch;
  });

  let extentedFilteredVCMetrics = structuredClone(filteredVCMetrics);
  extentedFilteredVCMetrics.map((item) => {
    item.ordersSum = getSum(item.wbOrdersTotal, startDate, endDate);
    item.lastWBstock = getDataForPeriod(item.wbStocksTotal, startDate, endDate);
    item.salesSum = getSumRaw(item.sales, item.rawSales, startDate, endDate);
    item.debSum = getSumRaw(
      item.dailyEbitda,
      item.rawDailyEbitda,
      startDate,
      endDate
    );
    item.debWOAdsSum = getSumRaw(
      item.dailyEbitdaWoAds,
      item.dailyEbitdaWoAdsRaw,
      startDate,
      endDate
    );
    item.adsCostsSum = getSum(item.adsCosts, startDate, endDate);
    item.costPerOrder = calculateCostPerOrder(
      item.wbOrdersTotal,
      item.adsCosts
    );
    item.costPerOrderAVG = getAverage(item.costPerOrder, startDate, endDate);
    return item;
  });

  // extentedFilteredVCMetrics.sort((a, b) => (a.debSum > b.debSum ? -1 : 1));
  getSortedData(extentedFilteredVCMetrics, selectedSorting);

  return (
    <>
      {isLoading || tagsIsLoading ? (
        <FaSpinner className="spinner" />
      ) : (
        <animated.div style={{ ...animStyles }}>
          <section>
            <h1>Товары</h1>
            <VendorCodesFilters />
            <VendorCodesTable data={extentedFilteredVCMetrics} />
          </section>
        </animated.div>
      )}
    </>
  );
};

export default VendorCodesList;

const getSortedData = (data, selectedSorting) => {
  switch (selectedSorting) {
    case '% Выкупа ↓':
      data.sort((a, b) => (a.buyoutP > b.buyoutP ? -1 : 1));
      break;
    case '% Выкупа ↑':
      data.sort((a, b) => (a.buyoutP > b.buyoutP ? 1 : -1));
      break;
    case 'Оборачиваемость WB ↓':
      data.sort((a, b) => (a.turnoverWB > b.turnoverWB ? -1 : 1));
      break;
    case 'Оборачиваемость WB ↑':
      data.sort((a, b) => (a.turnoverWB > b.turnoverWB ? 1 : -1));
      break;
    case 'EBITDA / день (сумм.) ↓':
      data.sort((a, b) => (a.debSum > b.debSum ? -1 : 1));
      break;
    case 'EBITDA / день (сумм.) ↑':
      data.sort((a, b) => (a.debSum > b.debSum ? 1 : -1));
      break;
    case 'Заказы ↓':
      data.sort((a, b) => (a.ordersSum > b.ordersSum ? -1 : 1));
      break;
    case 'Заказы ↑':
      data.sort((a, b) => (a.ordersSum > b.ordersSum ? 1 : -1));
      break;
    case 'ABC ↓':
      data.sort(function (a, b) {
        const orderABC = ['AAA', 'A', 'B', 'BC30', 'BC10', 'C', 'G', ''];
        var indexA = orderABC.indexOf(a.abcCurrent);
        var indexB = orderABC.indexOf(b.abcCurrent);
        return indexA > indexB ? 1 : -1;
      });
      break;
    case 'ABC ↑':
      data.sort(function (a, b) {
        const orderABC = ['AAA', 'A', 'B', 'BC30', 'BC10', 'C', 'G', ''];
        var indexA = orderABC.indexOf(a.abcCurrent);
        var indexB = orderABC.indexOf(b.abcCurrent);
        return indexA > indexB ? -1 : 1;
      });
      break;
    default:
      data.sort((a, b) => (a.debSum > b.debSum ? -1 : 1));
  }
};
