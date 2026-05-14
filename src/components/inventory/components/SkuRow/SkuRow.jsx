import React, { useRef, useEffect } from 'react';
import SkuCard from '../SkuCard/SkuCard';
import SkuGanttRow from '../SkuGanttRow/SkuGanttRow';
import styles from './SkuRow.module.css';

const SkuRow = ({
  sku, weeks, months, ordersMap, extraStock, startCalcDates,
  fullSkuList, dateRange, rowIndex,
  onRegisterScrollRef, onSyncScroll,
  onExtraStockChange, onStartCalcDateChange,
  onApplyStartCalcDateToAll, onDeleteSingleOrder,
}) => {
  const tableRef = useRef(null);
  useEffect(() => { onRegisterScrollRef(rowIndex + 1, tableRef); }, [rowIndex]);

  return (
    <div className={styles.skuRow}>
      <SkuCard
        sku={sku}
        dateRange={dateRange}
        startCalcDate={startCalcDates[sku.vcName]}
        fullSkuList={fullSkuList}
        onStartCalcDateChange={onStartCalcDateChange}
        onApplyStartCalcDateToAll={onApplyStartCalcDateToAll}
        onDeleteSingleOrder={() => onDeleteSingleOrder(sku, rowIndex)}
      />
      <div className={styles.ganttWrapper}>
        <SkuGanttRow
          sku={sku}
          weeks={weeks}
          months={months}
          ordersMap={ordersMap}
          extraStock={extraStock}
          startCalcDate={startCalcDates[sku.vcName]}
          tableRef={tableRef}
          onScroll={() => onSyncScroll(rowIndex + 1)}
          onExtraStockChange={onExtraStockChange}
        />
      </div>
    </div>
  );
};

export default SkuRow;
