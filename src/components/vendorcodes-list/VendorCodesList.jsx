import { FaSpinner } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSpring, animated } from '@react-spring/web';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaGripVertical } from 'react-icons/fa';
import { TbListDetails } from 'react-icons/tb';
import { LuColumns3 } from 'react-icons/lu';

import styles from './style.module.css';

import CategoriesColumnsSettings from '../categories_columns_settings/CategoriesColumnsSettings';

import {
  fetchVendorCodeMetrics,
  selectVendorCodeMetrics,
  selectIsLoading,
  selectTagsIsLoading,
  selectPageVendorcodes,
  selectVCsPerPageVendorcodes,
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
  selectVCTagsClothFilter,
  selectVCTagsOthersFilter,
} from '../../redux/slices/filterSlice';
import { fetchAvailableTags } from '../../redux/slices/vendorCodeSlice';
import { hostName } from '../../utils/host';
import { selectNotificationMessage } from '../../redux/slices/notificationSlice';

import {
  getSumNew,
  getSumRawNew,
  getAverageNew,
} from '../../utils/dataSlicing';
import { calculateCostPerOrder } from '../../utils/calculations';
import ExportToXSLXButtonVC from '../export_to_xlsx_button_vc/exportToXSLXButtonVC';

const initialColumns = [
  { key: 'tags', label: 'Теги', hidden: false },
  { key: 'tagsCloth', label: 'Теги (ткань)', hidden: false },
  { key: 'tagsOthers', label: 'Теги (доп.)', hidden: false },
  { key: 'orders', label: 'Заказы', hidden: false },
  { key: 'sales', label: 'Выкупы', hidden: false },
  { key: 'wbStocks', label: 'Остатки WB', hidden: false },
  { key: 'barcodesOrdersSum', label: 'В заказе', hidden: false },
  // { key: 'msStocks', label: 'Остаток МС', hidden: false },
  { key: 'deadline', label: 'Дедлайн', hidden: false },
  { key: 'turnover', label: 'Оборачиваемость WB', hidden: false },
  // { key: 'turnoverBO', label: 'Обор-ть WB (выкуп)', hidden: false },
  { key: 'ebitda', label: 'EBITDA', hidden: false },
  { key: 'ebitdaDaily', label: 'EBITDA/День', hidden: false },
  { key: 'ebitdaDailyWOADS', label: 'EBITDA/День без РК', hidden: false },
  { key: 'campaigns', label: 'Кампании', hidden: false },
  { key: 'adsCosts', label: 'Расходы на РК ВБ', hidden: false },
  { key: 'cpo', label: 'CPO', hidden: false },
  { key: 'cps', label: 'CPS', hidden: false },
  { key: 'roi', label: 'ROI', hidden: false },
  { key: 'buyout', label: '% Выкупа', hidden: false },
  { key: 'priceBSPP', label: 'Цена до СПП', hidden: false },

  // { key: 'priceASPP', label: 'Цена после СПП', hidden: false },
  { key: 'selfPrice', label: 'Себестоимость', hidden: false },
  // { key: 'selfPriceWONDS', label: 'Себестоимость без НДС', hidden: false },

  { key: 'addToCart', label: '% Добавления в корзину', hidden: false },
  { key: 'cartToOrder', label: '% Из корзины в заказ', hidden: false },
  { key: 'clickToOrder', label: '% Из клика в заказ', hidden: false },
];

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
  const tagsClothFilter = useSelector(selectVCTagsClothFilter);
  const tagsOthersFilter = useSelector(selectVCTagsOthersFilter);
  const startDate = new Date(dateFilter.start);
  const endDate = new Date(dateFilter.end);
  const notificationMessage = useSelector(selectNotificationMessage);
  const vcsPerPage = useSelector(selectVCsPerPageVendorcodes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [columns, setColumns] = useState(initialColumns);
  const originalColumnsRef = useRef(initialColumns);

  // const [columns, setColumns] = useState(initialColumns);
  // const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApplyColumns = (newColumns) => {
    setColumns(newColumns);
    setIsModalOpen(false);
  };

  const selectedSorting = useSelector(selectVCSortingType);

  const animStyles = useSpring({
    loop: false,
    from: { opacity: '0' },
    to: { opacity: '1' },
    config: { duration: '600' },
  });

  const fStartDate = `${startDate.getFullYear()}-${String(
    startDate.getMonth() + 1
  ).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
  const fEndDate = `${endDate.getFullYear()}-${String(
    endDate.getMonth() + 1
  ).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    if (notificationMessage === '') {
      dispatch(
        fetchVendorCodeMetrics(
          `${hostName}/vendorcode/data/?start_date=${fStartDate}&end_date=${fEndDate}`
        )
      );
      dispatch(fetchAvailableTags(`${hostName}/tags/all_tags`));
    }
  }, [dispatch, notificationMessage, fStartDate, fEndDate]);

  const includesAny = (arr, values) => values.some((v) => arr.includes(v));

  const filteredVCMetrics = vendorCodesWMetrics.filter((vc) => {
    let categoryMatch = true;
    let vcNameMatch = true;
    let abcMatch = true;
    let tagMatch = true;
    let tagClothMatch = true;
    let tagOthersMatch = true;
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
      tagMatch = includesAny(tagsFilter, vc.tagsMain);
    }
    if (tagsClothFilter.length !== 0) {
      tagClothMatch = includesAny(tagsClothFilter, vc.tagsCloth);
    }
    if (tagsOthersFilter.length !== 0) {
      tagOthersMatch = includesAny(tagsOthersFilter, vc.tagsOthers);
    }
    return (
      categoryMatch &&
      vcNameMatch &&
      abcMatch &&
      tagMatch &&
      tagClothMatch &&
      tagOthersMatch
    );
  });

  let extentedFilteredVCMetrics = structuredClone(filteredVCMetrics);

  extentedFilteredVCMetrics.map((item) => {
    item.ordersSum = getSumNew(item.wbOrdersTotal);
    item.lastWBstock = item.wbStocksTotal;
    item.salesSum = getSumRawNew(item.sales, item.rawSales);
    item.debSum = getSumRawNew(item.dailyEbitda, item.rawDailyEbitda);
    item.debWOAdsSum = getSumRawNew(
      item.dailyEbitdaWoAds,
      item.dailyEbitdaWoAdsRaw
    );
    item.adsCostsSum = getSumNew(item.adsCosts);
    item.costPerOrder = calculateCostPerOrder(
      item.wbOrdersTotal,
      item.adsCosts
    );
    item.costPerOrderAVG = getAverageNew(item.costPerOrder, startDate, endDate);
    item.priceAVG = getAverageNew(item.priceBeforeDisc, startDate, endDate);
    item.cartToOrderAVG = getAverageNew(item.cartToOrder, startDate, endDate);
    item.clickToOrderAVG = getAverageNew(item.clickToOrder, startDate, endDate);
    item.addToCartAVG = getAverageNew(item.addToCart, startDate, endDate);
    return item;
  });

  // extentedFilteredVCMetrics.sort((a, b) => (a.debSum > b.debSum ? -1 : 1));
  getSortedData(extentedFilteredVCMetrics, selectedSorting);

  const dataSplitted = splitArray(extentedFilteredVCMetrics, vcsPerPage);

  return (
    <>
      {isLoading || tagsIsLoading ? (
        <FaSpinner className="spinner" />
      ) : (
        <animated.div style={{ ...animStyles }}>
          <section>
            <div className={styles.headerBlock}>
              <h1>Товары</h1>
              <div
                className={styles.columnSettingsBtn}
                onClick={() => setIsModalOpen(true)}
              >
                <LuColumns3 />
              </div>
              <div>
                <ExportToXSLXButtonVC
                  vendorCodeMetrics={extentedFilteredVCMetrics}
                />
              </div>
            </div>
            <div className={styles.settingsTop}>
              <VendorCodesFilters />
            </div>
            <div className={styles.tableSection}>
              <VendorCodesTable
                columns={columns}
                data={extentedFilteredVCMetrics}
                dataSplitted={dataSplitted}
              />
              <CategoriesColumnsSettings
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentColumns={columns}
                initialColumns={originalColumnsRef.current}
                onApply={handleApplyColumns}
              />
            </div>
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
    case 'Рекламные расходы ↓':
      data.sort((a, b) => (a.adsCostsSum > b.adsCostsSum ? -1 : 1));
      break;
    case 'Рекламные расходы ↑':
      data.sort((a, b) => (a.adsCostsSum > b.adsCostsSum ? 1 : -1));
      break;
    case 'ROI ↓':
      data.sort((a, b) => (a.roi > b.roi ? -1 : 1));
      break;
    case 'ROI ↑':
      data.sort((a, b) => (a.roi > b.roi ? 1 : -1));
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

function splitArray(arr, vcsPerPage) {
  const result = [];
  for (let i = 0; i < arr.length; i += vcsPerPage) {
    result.push(arr.slice(i, i + vcsPerPage));
  }
  if (result.length === 0) {
    return [[]];
  }
  return result;
}
