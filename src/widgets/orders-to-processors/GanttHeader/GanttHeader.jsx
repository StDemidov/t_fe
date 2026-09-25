import React, { useMemo } from 'react';
import styles from './GanttHeader.module.css';

const GanttHeader = ({ weeks, months, totalNewOrders }) => {
  const { monthStartSet, weekStartSet } = useMemo(() => {
    const mSet = new Set(),
      wSet = new Set();
    let idx = 0;
    months.forEach((m, mi) => {
      if (mi > 0) mSet.add(idx);
      for (let w = 1; w < m.span; w++) wSet.add(idx + w);
      idx += m.span;
    });
    return { monthStartSet: mSet, weekStartSet: wSet };
  }, [months]);

  return (
    <div className={styles.headerRow}>
      <div className={styles.leftPlaceholder}>Информация по артикулам</div>

      <div className={styles.tableWrapper}>
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
                  } ${!monthStartSet.has(i) && weekStartSet.has(i) ? styles.weekSepWeek : ''} ${
                    monthStartSet.has(i + 1) ? styles.backWeekMonthSep : ''
                  }`}
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

export default GanttHeader;