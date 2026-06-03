import React, { useRef, useEffect, useMemo } from 'react';
import styles from './InventoryTableHeader.module.css';

const InventoryTableHeader = ({
  weeks,
  months,
  totalNewOrders,
  onRegisterScrollRef,
  onSyncScroll,
}) => {
  const tableRef = useRef(null);
  useEffect(() => {
    onRegisterScrollRef(0, tableRef);
  }, []);

  const monthStartSet = useMemo(() => {
    const set = new Set();
    let idx = 0;
    months.forEach((m, mi) => {
      if (mi > 0) set.add(idx);
      idx += m.span;
    });
    return set;
  }, [months]);

  return (
    <div className={styles.headerRow}>
      <div className={styles.leftPlaceholder}>Информация по артикулам</div>

      <div
        className={styles.tableWrapper}
        ref={tableRef}
        onScroll={() => onSyncScroll(0)}
      >
        <table className={styles.ganttTable}>
          {/* colgroup MUST match gantt colgroup exactly */}
          <colgroup>
            <col style={{ width: '54px' }} />
            <col style={{ width: '64px' }} />
            <col style={{ width: '70px' }} />
            <col style={{ width: '60px' }} />
            <col style={{ width: '120px' }} />
            {weeks.map((_, i) => (
              <col key={i} style={{ width: '42px' }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className={styles.colSize} rowSpan={2}>
                <span className={`${styles.colLabel} ${styles.colLabelSize}`}>
                  Размер
                </span>
              </th>
              <th className={styles.colOrders} rowSpan={2}>
                <span className={styles.colLabel}>В заказе</span>
              </th>
              <th className={styles.colDeficit} rowSpan={2}>
                <span className={styles.colLabel}>Дефицит</span>
              </th>
              <th className={styles.colTurnover} rowSpan={2}>
                <span className={styles.colLabel}>Обор.</span>
              </th>
              <th className={styles.colNewOrder} rowSpan={2}>
                <div className={styles.newOrderBlock}>
                  <span className={styles.newOrderTitle}>Сумма заказов</span>
                  <span className={styles.newOrderSumPill}>
                    {totalNewOrders}
                  </span>
                </div>
              </th>
              {months.map((month, mi) => (
                <th
                  key={mi}
                  colSpan={month.span}
                  className={`${styles.monthCell} ${
                    mi > 0 ? styles.monthSep : ''
                  }`}
                >
                  {month.name.toUpperCase()}
                </th>
              ))}
            </tr>
            <tr>
              {weeks.map((week, i) => (
                <th
                  key={i}
                  className={`${styles.weekCell} ${
                    monthStartSet.has(i) ? styles.weekMonthSep : ''
                  } ${monthStartSet.has(i + 1) ? styles.backWeekMonthSep : ''}`}
                >
                  {week.start}–{week.end}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
    </div>
  );
};

export default InventoryTableHeader;
