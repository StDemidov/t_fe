import React from 'react';
import styles from './InventoryToolbar.module.css';

import InventoryDateFilter from '../filters/InventoryDateFilter';
import InventorySortingFilter from '../filters/InventorySortingFilter';
import InventoryCategoryFilter from '../filters/InventoryCategoryFilter';
import InventoryTagsMainFilter from '../filters/InventoryTagsMainFilter';
import InventoryTagsClothFilter from '../filters/InventoryTagsClothFilter';
import InventoryTagsOthersFilter from '../filters/InventoryTagsOthersFilter';
import InventoryVcNameFilter from '../filters/InventoryVcNameFilter';
import InventoryCountryFilter from '../filters/InventoryCountryFilter';
import InventoryPatternFilter from '../filters/InventoryPatternFilter';
import InventoryOrderNameFilter from '../filters/InventoryOrderNameFilter';
import UploadOrderModal from '../UploadOrderModal/UploadOrderModal';
import DeleteOrderModal from '../DeleteOrderModal/DeleteOrderModal';

import { useDispatch } from 'react-redux';
import { setInventoryPage } from '../../redux/inventorySlice';
import { FaAngleLeft, FaAnglesLeft, FaAngleRight, FaAnglesRight } from 'react-icons/fa6';

const InventoryToolbar = ({
  allCategories, allTagsMain, allTagsCloth, allTagsOthers,
  allCountries, allPatterns, allOrderNames,
  uniqueOrderNames, ordersWithDates, currentPage, totalPages, onExportXls,
  onResetAllOrders, hasChanges,
}) => {
  const dispatch = useDispatch();
  const go = (page) => dispatch(setInventoryPage(page));

  return (
    <div className={styles.toolbar}>
      <div className={styles.filtersRow}>
        <div className={styles.filtersGroup}>
          <InventoryDateFilter />
          <InventorySortingFilter />
          <InventoryCategoryFilter options={allCategories} />
          <InventoryTagsMainFilter options={allTagsMain} />
          <InventoryTagsClothFilter options={allTagsCloth} />
          <InventoryTagsOthersFilter options={allTagsOthers} />
          <InventoryCountryFilter options={allCountries} />
          <InventoryPatternFilter options={allPatterns} />
          <InventoryOrderNameFilter options={allOrderNames} />
          <InventoryVcNameFilter />
        </div>

        <div className={styles.actionsGroup}>
          {/* "Сбросить изменения" — first, active only when changes exist */}
          <button
            className={styles.actionBtnReset}
            onClick={onResetAllOrders}
            disabled={!hasChanges}
          >
            Сбросить изменения
          </button>
          <UploadOrderModal existingOrders={uniqueOrderNames} />
          <DeleteOrderModal existingOrders={uniqueOrderNames} ordersWithDates={ordersWithDates ?? []} />
          <button className={styles.actionBtnSecondary} onClick={onExportXls}>
            Сформировать
          </button>
        </div>
      </div>

      <div className={styles.paginatorRow}>
        <FaAnglesLeft
          className={currentPage > 1 ? styles.arrow : styles.arrowDisabled}
          onClick={() => currentPage > 1 && go(1)}
        />
        <FaAngleLeft
          className={currentPage > 1 ? styles.arrow : styles.arrowDisabled}
          onClick={() => currentPage > 1 && go(currentPage - 1)}
        />
        <span className={styles.pageLabel}>{currentPage} / {totalPages}</span>
        <FaAngleRight
          className={currentPage < totalPages ? styles.arrow : styles.arrowDisabled}
          onClick={() => currentPage < totalPages && go(currentPage + 1)}
        />
        <FaAnglesRight
          className={currentPage < totalPages ? styles.arrow : styles.arrowDisabled}
          onClick={() => currentPage < totalPages && go(totalPages)}
        />
      </div>
    </div>
  );
};

export default InventoryToolbar;
