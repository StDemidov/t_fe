import { FaSpinner } from 'react-icons/fa';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaGripVertical } from 'react-icons/fa';
import { TbListDetails } from 'react-icons/tb';

import styles from './style.module.css';

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
  selectVCTagsClothFilter,
  selectVCTagsOthersFilter,
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

const initialColumns = [
  { key: 'tags', label: 'Теги', hidden: false },
  { key: 'tagsCloth', label: 'Теги (ткань)', hidden: false },
  { key: 'tagsOthers', label: 'Теги (доп.)', hidden: false },
  { key: 'orders', label: 'Заказы', hidden: false },
  { key: 'sales', label: 'Выкупы', hidden: false },
  { key: 'wbStocks', label: 'Остатки WB', hidden: false },
  { key: 'msStocks', label: 'Остаток МС', hidden: false },
  { key: 'ebitda', label: 'EBITDA', hidden: false },
  { key: 'ebitdaDaily', label: 'EBITDA/День', hidden: false },
  { key: 'ebitdaDailyWOADS', label: 'EBITDA/День без РК', hidden: false },
  { key: 'campaigns', label: 'Кампании', hidden: false },
  { key: 'adsCosts', label: 'Расходы на РК ВБ', hidden: false },
  { key: 'cpo', label: 'CPO', hidden: false },
  { key: 'cps', label: 'CPS', hidden: false },
  { key: 'buyout', label: '% Выкупа', hidden: false },
  { key: 'priceBSPP', label: 'Цена до СПП', hidden: false },
  { key: 'priceASPP', label: 'Цена после СПП', hidden: false },
  { key: 'selfPrice', label: 'Себестоимость', hidden: false },
  { key: 'selfPriceWONDS', label: 'Себестоимость без НДС', hidden: false },
  { key: 'turnover', label: 'Оборачиваемость WB', hidden: false },
  { key: 'turnoverBO', label: 'Обор-ть WB (выкуп)', hidden: false },
  { key: 'addToCart', label: '% Добавления в корзину', hidden: false },
  { key: 'cartToOrder', label: '% Из корзины в заказ', hidden: false },
  { key: 'clickToOrder', label: '% Из клика в заказ', hidden: false },
];

const SortableItem = ({ column, toggleHidden }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: column.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '8px',
    border: '1px solid #ddd',
    background: column.hidden ? '#ebebeb' : '#fff',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={styles.sortableDiv}
    >
      {/* Иконка для начала драг-события */}

      <div className={styles.sortableItem}>
        <FaGripVertical
          {...listeners}
          style={{ cursor: 'grab', marginRight: '10px' }}
        />
        <label>
          <input
            type="checkbox"
            checked={!column.hidden}
            onChange={(e) => {
              toggleHidden(column.key);
            }}
          />{' '}
          <span className={styles.customCheckbox}></span>
          {column.label}
        </label>
      </div>
    </div>
  );
};

const ColumnSettings = ({
  columns,
  setColumns,
  setIsModalOpen,
  initialColumns,
}) => {
  const [tempCols, setTempCols] = useState(columns);
  const toggleHidden = (key) => {
    setTempCols((prevColumns) =>
      prevColumns.map((col) =>
        col.key === key ? { ...col, hidden: !col.hidden } : col
      )
    );
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = tempCols.findIndex((col) => col.key === active.id);
      const newIndex = tempCols.findIndex((col) => col.key === over.id);
      setTempCols((prevColumns) => arrayMove(prevColumns, oldIndex, newIndex));
    }
  };

  const clickApply = () => {
    setIsModalOpen(false);
    setColumns(tempCols);
  };

  const clickReset = () => {
    setIsModalOpen(false);
    setColumns(initialColumns);
    setTempCols(initialColumns);
  };

  return (
    <>
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={tempCols.map((col) => col.key)}>
          {tempCols.map((column) => (
            <SortableItem
              key={column.key}
              column={column}
              toggleHidden={toggleHidden}
            />
          ))}
        </SortableContext>
      </DndContext>
      <div className={styles.dropdownActions}>
        <button className={styles.dropdownClose} onClick={clickApply}>
          Применить
        </button>
        <button className={styles.dropdownReset} onClick={clickReset}>
          Сбросить
        </button>
      </div>
    </>
  );
};

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

  const [columns, setColumns] = useState(initialColumns);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    item.cartToOrderAVG = getAverage(item.cartToOrder, startDate, endDate);
    item.clickToOrderAVG = getAverage(item.clickToOrder, startDate, endDate);
    item.addToCartAVG = getAverage(item.addToCart, startDate, endDate);
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
            <div className={styles.settingsTop}>
              <div>
                <button
                  onClick={() => setIsModalOpen(!isModalOpen)}
                  className={styles.tableSettings}
                >
                  <TbListDetails />
                </button>
              </div>
              <VendorCodesFilters />
            </div>
            <div className={styles.tableSection}>
              {isModalOpen && (
                <div className={styles.modalWindow}>
                  <ColumnSettings
                    columns={columns}
                    setColumns={setColumns}
                    setIsModalOpen={setIsModalOpen}
                    initialColumns={initialColumns}
                  />
                </div>
              )}
              <VendorCodesTable
                columns={columns}
                data={extentedFilteredVCMetrics}
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
