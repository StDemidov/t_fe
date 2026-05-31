import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InventorySkeleton from './InventorySkeleton/InventorySkeleton';
import { useSpring, animated } from '@react-spring/web';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

import {
  fetchInventory,
  setInventoryPage,
  setStartCalcDates,
  updateExtraStockItem,
  clearExtraStock,
  updateStartCalcDate,
  clearStartCalcDates,
  selectExtraStock,
  selectStartCalcDates,
} from '../redux/inventorySlice';
import { selectNotificationMessage } from '../../../redux/slices/notificationSlice';
import { hostName } from '../../../utils/host';

import { useInventoryData } from '../hooks/useInventoryData';
import { isValidDateFormat } from '../utils/inventoryHelpers';

import InventoryToolbar from './InventoryToolbar/InventoryToolbar';
import InventoryTableHeader from './InventoryTableHeader/InventoryTableHeader';
import SkuRow from './SkuRow/SkuRow';

import styles from './InventoryPage.module.css';

const InventoryPage = () => {
  const dispatch = useDispatch();
  const notificationMessage = useSelector(selectNotificationMessage);

  useEffect(() => {
    if (notificationMessage === '') {
      dispatch(fetchInventory(`${hostName}/barcode/get_bc_stats_w_preds`));
    }
  }, [notificationMessage]);

  const {
    currentPageData,
    filteredSkuList,
    allSkuList,
    totalPages,
    currentPage,
    ordersMap,
    isLoading,
    weeks,
    months,
    allCategories,
    allTagsMain,
    allTagsCloth,
    allTagsOthers,
    allCountries,
    allPatterns,
    allOrderNames,
    uniqueOrderNames,
    ordersWithDates,
    dateRange,
  } = useInventoryData();

  // Persisted in Redux — survive page navigation
  const extraStock = useSelector(selectExtraStock);
  const startCalcDates = useSelector(selectStartCalcDates);

  // Synchronized scroll
  const scrollRefs = useRef([]);

  const handleRegisterScrollRef = useCallback((index, ref) => {
    scrollRefs.current[index] = ref;
  }, []);

  const handleSyncScroll = useCallback((sourceIndex) => {
    const source = scrollRefs.current[sourceIndex]?.current;
    if (!source) return;
    const { scrollLeft } = source;
    scrollRefs.current.forEach((ref, i) => {
      if (i !== sourceIndex && ref?.current)
        ref.current.scrollLeft = scrollLeft;
    });
  }, []);

  const handleExtraStockChange = useCallback(
    (barcode, value) => {
      const num = Number(value) || 0;
      dispatch(updateExtraStockItem({ barcode, value: num }));
    },
    [dispatch]
  );

  const handleDeleteAllOrders = useCallback(() => {
    // Values intentionally NOT cleared after export
  }, [dispatch]);

  const handleResetAllOrders = useCallback(() => {
    dispatch(clearExtraStock());
    dispatch(clearStartCalcDates());
  }, [dispatch]);

  const handleDeleteSingleOrder = useCallback(
    (sku) => {
      sku.barcodes.forEach((bc) =>
        dispatch(updateExtraStockItem({ barcode: bc.barcode, value: 0 }))
      );
      dispatch(updateStartCalcDate({ vcName: sku.vcName, date: null }));
    },
    [dispatch]
  );

  const handleStartCalcDateChange = useCallback(
    (vcName, value) => {
      if (isValidDateFormat(value))
        dispatch(updateStartCalcDate({ vcName, date: value }));
    },
    [dispatch]
  );

  const handleApplyStartCalcDateToAll = useCallback(
    (vcName, skuList) => {
      const date = startCalcDates[vcName];
      if (!date) return;
      dispatch(
        setStartCalcDates(
          Object.fromEntries(skuList.map((s) => [s.vcName, date]))
        )
      );
    },
    [dispatch, startCalcDates]
  );

  const handleExportXls = useCallback(async () => {
    // Group rows by pattern
    const byPattern = {};

    Object.entries(extraStock).forEach(([barcode, value]) => {
      if (!value || value <= 0) return;
      const sku = allSkuList.find((s) =>
        s.barcodes.some((bc) => bc.barcode === barcode)
      );
      if (!sku) return;
      const pattern = sku.pattern || 'Без лекала';
      if (!byPattern[pattern]) byPattern[pattern] = [];
      byPattern[pattern].push({
        barcode,
        qty: Math.round(value),
        vcName: sku.vcName,
      });
    });

    const patterns = Object.keys(byPattern);
    if (patterns.length === 0) return;

    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(
      today.getMonth() + 1
    ).padStart(2, '0')}.${today.getFullYear()}`;

    // Build xlsx buffer per pattern
    const buildXlsx = (rows) => {
      // Structure: A=barcode, B=empty, C=qty, D=vcName
      const wsData = [
        ['Баркод', '', 'Количество', 'Артикул'],
        ...rows.map((r) => [r.barcode, '', r.qty, r.vcName]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Лист1');
      return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    };

    if (patterns.length === 1) {
      // Single file — download directly
      const pattern = patterns[0];
      const rows = byPattern[pattern];
      const totalQty = rows.reduce((s, r) => s + r.qty, 0);
      const fileName = `${pattern}_${totalQty}_dozakaz_${dateStr}.xlsx`;
      const buf = buildXlsx(rows);
      const blob = new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Multiple files — zip them
      const zip = new JSZip();
      patterns.forEach((pattern) => {
        const rows = byPattern[pattern];
        const totalQty = rows.reduce((s, r) => s + r.qty, 0);
        const fileName = `${pattern}_${totalQty}_dozakaz_${dateStr}.xlsx`;
        const buf = buildXlsx(rows);
        zip.file(fileName, buf);
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipName = `Дозаказы по баркодам (${dateStr}).zip`;
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = zipName;
      a.click();
      URL.revokeObjectURL(url);
    }

    // Values intentionally NOT cleared after export
  }, [extraStock, allSkuList, startCalcDates, dispatch]);

  const totalNewOrders = useMemo(() => {
    const filteredBarcodes = new Set(
      filteredSkuList.flatMap((sku) => sku.barcodes.map((bc) => bc.barcode))
    );
    return Object.entries(extraStock).reduce(
      (acc, [barcode, v]) => (filteredBarcodes.has(barcode) ? acc + v : acc),
      0
    );
  }, [extraStock, filteredSkuList]);
  const hasChanges =
    totalNewOrders > 0 || Object.keys(startCalcDates).length > 0;

  const animStyles = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 350 },
  });

  if (isLoading) {
    return <InventorySkeleton />;
  }

  if (currentPageData.length === 0) {
    return (
      <div className={styles.inventoryPage}>
        <InventoryToolbar
          allCategories={allCategories}
          allTagsMain={allTagsMain}
          allTagsCloth={allTagsCloth}
          allTagsOthers={allTagsOthers}
          allPatterns={allPatterns}
          allOrderNames={allOrderNames}
          uniqueOrderNames={uniqueOrderNames}
          currentPage={1}
          totalPages={1}
          onExportXls={handleExportXls}
          onResetAllOrders={handleResetAllOrders}
          hasChanges={hasChanges}
        />
        <div className={styles.emptyState}>Ничего не найдено</div>
      </div>
    );
  }

  return (
    <animated.div style={animStyles} className={styles.inventoryPage}>
      <InventoryToolbar
        allCategories={allCategories}
        allTagsMain={allTagsMain}
        allTagsCloth={allTagsCloth}
        allTagsOthers={allTagsOthers}
        allCountries={allCountries}
        allPatterns={allPatterns}
        allOrderNames={allOrderNames}
        uniqueOrderNames={uniqueOrderNames}
        ordersWithDates={ordersWithDates}
        currentPage={currentPage}
        totalPages={totalPages}
        onExportXls={handleExportXls}
        onResetAllOrders={handleResetAllOrders}
        hasChanges={hasChanges}
      />

      <InventoryTableHeader
        weeks={weeks}
        months={months}
        totalNewOrders={totalNewOrders}
        onRegisterScrollRef={handleRegisterScrollRef}
        onSyncScroll={handleSyncScroll}
      />

      <div className={styles.skuList}>
        {currentPageData.map((sku, index) => (
          <SkuRow
            key={sku.id}
            sku={sku}
            weeks={weeks}
            months={months}
            ordersMap={ordersMap}
            extraStock={extraStock}
            startCalcDates={startCalcDates}
            fullSkuList={filteredSkuList}
            dateRange={dateRange}
            rowIndex={index}
            onRegisterScrollRef={handleRegisterScrollRef}
            onSyncScroll={handleSyncScroll}
            onExtraStockChange={handleExtraStockChange}
            onStartCalcDateChange={handleStartCalcDateChange}
            onApplyStartCalcDateToAll={handleApplyStartCalcDateToAll}
            onDeleteSingleOrder={handleDeleteSingleOrder}
          />
        ))}
      </div>
    </animated.div>
  );
};

export default InventoryPage;
