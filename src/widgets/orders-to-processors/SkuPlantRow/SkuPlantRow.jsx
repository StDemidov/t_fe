import React from 'react';
import SkuPlantCard from '../SkuPlantCard/SkuPlantCard';
import ChartGanttRow from '../ChartGanttRow/ChartGanttRow';
import styles from './SkuPlantRow.module.css';

const SkuPlantRow = ({
  sku, weeks, months, extraOrders, startCalcDates, fullSkuList,
  onExtraOrderChange, onStartCalcDateChange,
  onApplyStartCalcDateToAll, onClearRow,
  onCategoryFilter, onPatternFilter, onCountryFilter,
}) => {
  return (
    <div className={styles.skuRow}>
      <SkuPlantCard
        sku={sku}
        startCalcDate={startCalcDates[sku.vendorCode]}
        extraOrders={extraOrders}
        fullSkuList={fullSkuList}
        onStartCalcDateChange={onStartCalcDateChange}
        onApplyStartCalcDateToAll={onApplyStartCalcDateToAll}
        onClearRow={() => onClearRow(sku)}
        onCategoryFilter={onCategoryFilter}
        onPatternFilter={onPatternFilter}
        onCountryFilter={onCountryFilter}
      />
      <div className={styles.ganttWrapper}>
        <ChartGanttRow
          sku={sku}
          weeks={weeks}
          months={months}
          extraOrders={extraOrders}
          startCalcDate={startCalcDates[sku.vendorCode]}
          onExtraOrderChange={onExtraOrderChange}
        />
      </div>
    </div>
  );
};

export default SkuPlantRow;