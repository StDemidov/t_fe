import { FaSpinner } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';

import {
  fetchVendorCodeMetrics,
  selectVendorCodeMetrics,
  selectIsLoading,
} from '../../redux/slices/vendorCodeSlice';
import VendorCodesTable from '../vendorcodes-table/VendorCodesTable';
import VendorCodesFilters from '../vendorcodes_filters/VendorCodesFilters';
import {
  selectVendorCodeAbcFilter,
  selectVendorCodeCategoryFilter,
  selectVCNameFilter,
  selectVCDatesFilter,
  selectVCSortingType,
} from '../../redux/slices/filterSlice';
import { hostName } from '../../utils/host';

const VendorCodesList = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const vendorCodesWMetrics = useSelector(selectVendorCodeMetrics);
  const categoryFilter = useSelector(selectVendorCodeCategoryFilter);
  const VCNameFilter = useSelector(selectVCNameFilter);
  const abcFilter = useSelector(selectVendorCodeAbcFilter);
  const dateFilter = useSelector(selectVCDatesFilter);
  const startDate = new Date(dateFilter.start);
  const endDate = new Date(dateFilter.end);
  const selectedSorting = useSelector(selectVCSortingType);

  const animStyles = useSpring({
    loop: false,
    from: { opacity: '0' },
    to: { opacity: '1' },
    config: { duration: '600' },
  });

  useEffect(() => {
    dispatch(fetchVendorCodeMetrics(`${hostName}/vendorcode/`));
  }, [dispatch]);

  const filteredVCMetrics = vendorCodesWMetrics.filter((vc) => {
    let categoryMatch = true;
    let vcNameMatch = true;
    let abcMatch = true;
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
    return categoryMatch && vcNameMatch && abcMatch;
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
    return item;
  });

  // extentedFilteredVCMetrics.sort((a, b) => (a.debSum > b.debSum ? -1 : 1));
  getSortedData(extentedFilteredVCMetrics, selectedSorting);

  return (
    <>
      {isLoading ? (
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
    case 'EBITDA / день (сумм.) убыв.':
      data.sort((a, b) => (a.debSum > b.debSum ? -1 : 1));
      break;
    case 'EBITDA / день (сумм.) возр.':
      data.sort((a, b) => (a.debSum > b.debSum ? 1 : -1));
      break;
    case 'Заказы убыв.':
      data.sort((a, b) => (a.ordersSum > b.ordersSum ? -1 : 1));
      break;
    case 'Заказы возр.':
      data.sort((a, b) => (a.ordersSum > b.ordersSum ? 1 : -1));
      break;
    case 'ABC убыв.':
      data.sort(function (a, b) {
        const orderABC = ['AAA', 'A', 'B', 'BC30', 'BC10', 'C', 'G', ''];
        var indexA = orderABC.indexOf(a.abcCurrent);
        var indexB = orderABC.indexOf(b.abcCurrent);
        return indexA > indexB ? 1 : -1;
      });
      break;
    case 'ABC возр.':
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

const getDataForPeriod = (data, startDate, endDate) => {
  const todayDate = new Date();
  const startIndex = Math.ceil((todayDate - startDate) / (1000 * 60 * 60 * 24)); // Индекс начала
  const endIndex = Math.floor((todayDate - endDate) / (1000 * 60 * 60 * 24)); // Индекс конца
  // Проверяем, что индексы в пределах массива
  if (startIndex < 0 || endIndex >= data.length || startIndex < endIndex) {
    throw new Error('Период выходит за пределы массива');
  }
  // Извлекаем данные за указанный период
  if (endIndex === 1) {
    return data.slice(-startIndex + 1);
  }
  return data.slice(-startIndex + 1, -endIndex + 1);
};

const getSum = (data, startDate, endDate) => {
  const currData = getDataForPeriod(data, startDate, endDate);
  var sumData = currData.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
  return sumData;
};

const getDataForPeriodRaw = (data, raw_data, startDate, endDate) => {
  const todayDate = new Date();
  const startIndex = Math.ceil((todayDate - startDate) / (1000 * 60 * 60 * 24)); // Индекс начала
  const endIndex = Math.floor((todayDate - endDate) / (1000 * 60 * 60 * 24)); // Индекс конца
  if (startIndex <= raw_data.length + 1 && endIndex <= raw_data.length + 1) {
    if (endIndex === 1) {
      return raw_data.slice(-startIndex + 1);
    }
    return raw_data.slice(-startIndex + 1, -endIndex + 1);
  } else if (
    startIndex > raw_data.length + 1 &&
    endIndex > raw_data.length + 1
  ) {
    return data.slice(
      -startIndex + raw_data.length + 1,
      -endIndex + raw_data.length + 1
    ); // Используем reverse(), чтобы вернуть порядок
  } else if (
    startIndex > raw_data.length + 1 &&
    endIndex <= raw_data.length + 1
  ) {
    if (endIndex === 1) {
      return data.slice(-startIndex + raw_data.length + 1).concat(raw_data);
    }
  }
  return data
    .slice(-startIndex + raw_data.length + 1)
    .concat(raw_data.slice(0, -endIndex + 1));
};

const getSumRaw = (data, raw_data, startDate, endDate) => {
  const currData = getDataForPeriodRaw(data, raw_data, startDate, endDate);
  var sumData = currData.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
  return sumData;
};
