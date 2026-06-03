import React, { useMemo, useState, useCallback } from 'react';
import { CELL_STATUS } from '../../utils/inventoryHelpers';
import styles from './SkuGanttRow.module.css';

// ─── Gantt cell tooltip ───────────────────────────────────────────────────────
const GanttTooltip = ({ tooltip }) => {
  if (!tooltip) return null;
  const { x, y, weekLabel, lines } = tooltip;
  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 9999,
        pointerEvents: 'none',
        left: x,
        top: y,
        transform: 'translate(-50%, calc(-100% - 6px))',
        background: 'rgba(17,24,39,0.88)',
        borderRadius: 6,
        padding: '5px 9px',
        minWidth: 100,
        maxWidth: 180,
        boxShadow: '0 2px 10px rgba(0,0,0,0.22)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Week label — white, slightly bold */}
      {weekLabel && (
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#fff',
            lineHeight: 1.5,
            marginBottom: 2,
          }}
        >
          {weekLabel}
        </div>
      )}
      {/* Content lines — grayish */}
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontSize: 11,
            fontWeight: 400,
            color: '#B0B7C3',
            lineHeight: 1.5,
            whiteSpace: 'nowrap',
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

// ─── Build cells ──────────────────────────────────────────────────────────────
const buildCells = (barcode, weeks, ordersMap, extraStock, startCalcDate) => {
  const barcodeOrders = ordersMap[barcode.barcode] || [];
  const dateFrom = startCalcDate ? new Date(startCalcDate) : null;
  let stock = barcode.stock,
    extra = extraStock[barcode.barcode] || 0;
  let oi = 0,
    stockUsed = false,
    extraUsed = false;
  // Track the most recent order name AND amount for carry-over display
  let prevOrderName = null;
  let prevOrderAmount = null;

  return weeks.map((week, i) => {
    const forecast = barcode.weeklyForecasts[i] || 0;
    // stockPushed resets each week — mirrors old code's "stockPushed = false" at loop start
    let pushed = false;
    let newlyAdded = []; // orders added THIS week (for tooltip)
    let names = []; // order names for cell display

    // Pull orders if they're due and stock is insufficient
    if (oi < barcodeOrders.length && barcodeOrders[oi].date <= week.endDate) {
      while (oi < barcodeOrders.length && stock < forecast) {
        const o = barcodeOrders[oi];
        if (o.amount > 0) {
          names.push(o.name);
          newlyAdded.push({ name: o.name, amount: o.amount });
          // prevOrderName updates to the LATEST order (replaces, not accumulates)
          prevOrderName = o.name;
          prevOrderAmount = o.amount;
          stock += o.amount;
          stockUsed = true;
          pushed = true;
        }
        oi++;
      }
    }

    // Base status: purple only if new orders were added THIS week
    let status =
      names.length > 0
        ? CELL_STATUS.PURPLE
        : stock >= forecast
        ? CELL_STATUS.GREEN
        : stock > 0
        ? CELL_STATUS.YELLOW
        : CELL_STATUS.RED;

    const waitFuture =
      stock < forecast &&
      oi < barcodeOrders.length &&
      barcodeOrders[oi].date > week.endDate;
    const waitStart =
      dateFrom &&
      stock <= 0 &&
      stock < forecast &&
      oi >= barcodeOrders.length &&
      week.endDate < dateFrom;

    if (waitFuture || waitStart) {
      stock = 0;
      status = CELL_STATUS.GRAY;
    } else {
      if (
        stock < forecast &&
        extra > 0 &&
        (!dateFrom || week.endDate >= dateFrom)
      ) {
        const add = Math.min(extra, forecast - stock);
        extraUsed = true;
        stock += add;
        extra -= add;
        status = CELL_STATUS.BLUE;
      }
      // Carry-over purple: prev order still covers this week's need
      // Only purple if stock STILL adequate (not in deficit) — mirrors old code exactly
      if (stockUsed && !pushed && stock >= forecast && !extraUsed) {
        names.push(prevOrderName);
        status = CELL_STATUS.PURPLE;
      }
      stock -= forecast;
    }

    if (status === CELL_STATUS.YELLOW && dateFrom) {
      if (dateFrom > week.endDate) {
        stock = 0;
        status = CELL_STATUS.GRAY;
      } else status = CELL_STATUS.RED;
    }

    // Tooltip: for purple cells — show only current week's orders (or prevOrder for carry-over)
    const tooltipOrders =
      status === CELL_STATUS.PURPLE
        ? newlyAdded.length > 0
          ? newlyAdded
          : [{ name: prevOrderName, amount: prevOrderAmount }]
        : [];

    return { status, names, stock, forecast, tooltipOrders };
  });
};

const CSS = {
  [CELL_STATUS.GREEN]: styles.cellGreen,
  [CELL_STATUS.YELLOW]: styles.cellYellow,
  [CELL_STATUS.RED]: styles.cellRed,
  [CELL_STATUS.GRAY]: styles.cellGray,
  [CELL_STATUS.BLUE]: styles.cellBlue,
  [CELL_STATUS.PURPLE]: styles.cellPurple,
};

// ─── SkuGanttRow ──────────────────────────────────────────────────────────────
const SkuGanttRow = ({
  sku,
  weeks,
  months,
  ordersMap,
  extraStock,
  startCalcDate,
  tableRef,
  onScroll,
  onExtraStockChange,
}) => {
  const [tooltip, setTooltip] = useState(null);

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

  const barcodeRows = useMemo(
    () =>
      sku.barcodes.map((bc) => {
        const cells = buildCells(
          bc,
          weeks,
          ordersMap,
          extraStock,
          startCalcDate
        );
        const ordersInBD = ordersMap[bc.barcode]
          ? Math.round(ordersMap[bc.barcode].reduce((a, o) => a + o.amount, 0))
          : 0;

        const extraInput = extraStock[bc.barcode] || 0;
        const avgOrders = bc.avgOrders > 0 ? bc.avgOrders : 1;
        const buyout = bc.buyout > 0 ? bc.buyout : 1;
        const turnover = Math.round(
          (bc.stock + ordersInBD + extraInput) / avgOrders / buyout
        );

        return { bc, cells, ordersInBD, turnover };
      }),
    [sku.barcodes, weeks, ordersMap, extraStock, startCalcDate]
  );

  const totals = useMemo(() => {
    let sO = 0,
      sD = 0,
      sE = 0;
    barcodeRows.forEach(({ bc, cells, ordersInBD }) => {
      sO += ordersInBD;
      sE += extraStock[bc.barcode] || 0;
      const last = cells[cells.length - 1];
      if (last?.stock < 0) sD += -last.stock;
    });
    return { sO, sD, sE };
  }, [barcodeRows, extraStock]);

  const monthlyDeficits = useMemo(() => {
    const result = [];
    let weekIdx = 0;
    months.forEach((month) => {
      const lastWeekIdx = weekIdx + month.span - 1;
      let monthDeficit = 0;
      barcodeRows.forEach(({ cells }) => {
        const cell = cells[lastWeekIdx];
        if (cell && cell.stock < 0) monthDeficit += -cell.stock;
      });
      result.push(monthDeficit);
      weekIdx += month.span;
    });
    return result;
  }, [barcodeRows, months]);

  // Build tooltip lines per cell type
  const buildTooltipLines = useCallback((cell) => {
    const { status, stock, forecast, tooltipOrders } = cell;

    // RED — no tooltip
    if (status === CELL_STATUS.RED) return null;

    const lines = [];

    if (status === CELL_STATUS.PURPLE) {
      // Show orders: if amount known show it, otherwise just name (carry-over)
      tooltipOrders.forEach((od) => {
        if (od.amount != null) {
          lines.push(`${od.name}: ${od.amount} шт.`);
        } else {
          lines.push(`${od.name}`);
        }
      });
      // Remaining stock after filling forecast
      if (stock > 0) lines.push(`Остаток: ${stock} шт.`);
      // Need (forecast)
      if (forecast > 0) lines.push(`Потребность: ${forecast} шт.`);
    } else if (status === CELL_STATUS.GREEN) {
      if (forecast > 0) lines.push(`Потребность: ${forecast} шт.`);
      if (stock > 0) lines.push(`Остаток: ${stock} шт.`);
    } else if (status === CELL_STATUS.GRAY || status === CELL_STATUS.BLUE) {
      if (forecast > 0) lines.push(`Потребность: ${forecast} шт.`);
    } else if (status === CELL_STATUS.YELLOW) {
      if (forecast > 0) lines.push(`Потребность: ${forecast} шт.`);
      if (stock > 0) lines.push(`Остаток: ${stock} шт.`);
    }

    return lines.length > 0 ? lines : null;
  }, []);

  const handleCellMouseEnter = useCallback(
    (e, cell, weekLabel) => {
      const lines = buildTooltipLines(cell);
      if (!lines) return; // no tooltip for RED
      const r = e.currentTarget.getBoundingClientRect();
      setTooltip({
        x: r.left + r.width / 2,
        y: r.top,
        weekLabel,
        lines,
      });
    },
    [buildTooltipLines]
  );

  const handleCellMouseLeave = useCallback(() => setTooltip(null), []);

  return (
    <div className={styles.tableWrapper} ref={tableRef} onScroll={onScroll}>
      <GanttTooltip tooltip={tooltip} />
      <table className={styles.ganttTable}>
        <tbody>
          {barcodeRows.map(({ bc, cells, ordersInBD, turnover }) => {
            const last = cells[cells.length - 1];
            const deficit = last?.stock < 0 ? -last.stock : 0;
            return (
              <tr key={bc.barcode}>
                <td className={styles.colSize}>{bc.size}</td>
                <td className={styles.colOrders}>
                  {ordersInBD || <span className={styles.dash}>—</span>}
                </td>
                <td className={styles.colDeficit}>
                  {deficit || <span className={styles.dash}>—</span>}
                </td>
                <td className={styles.colTurnover}>
                  {turnover || <span className={styles.dash}>—</span>}
                </td>
                <td className={styles.colNewOrder}>
                  <input
                    type="number"
                    value={extraStock[bc.barcode] || ''}
                    onChange={(e) =>
                      onExtraStockChange(bc.barcode, e.target.value)
                    }
                    className={styles.extraStockInput}
                  />
                </td>
                {cells.map((cell, i) => {
                  const hasNames = cell.names.length > 0;
                  const hasNeg = !hasNames && cell.stock < 0;

                  const isMonth = monthStartSet.has(i);
                  const isWeek = !isMonth && weekStartSet.has(i);
                  return (
                    <td
                      key={i}
                      className={`${styles.ganttCell} ${CSS[cell.status]} ${
                        isMonth ? styles.monthSep : ''
                      } ${isWeek ? styles.weekSep : ''} ${
                        styles.cellHoverable
                      } ${monthStartSet.has(i + 1) ? styles.backMonthSep : ''}`}
                      onMouseEnter={(e) =>
                        handleCellMouseEnter(
                          e,
                          cell,
                          `${weeks[i].start}–${weeks[i].end}`
                        )
                      }
                      onMouseLeave={handleCellMouseLeave}
                    >
                      <div className={styles.cellInner}>
                        {cell.status === CELL_STATUS.PURPLE &&
                          cell.tooltipOrders.map((od, idx) => (
                            <div key={idx} className={styles.orderName}>
                              {od.name}
                            </div>
                          ))}
                        {cell.status !== CELL_STATUS.PURPLE &&
                          hasNames &&
                          cell.names.map((n, idx) => (
                            <div key={idx} className={styles.orderName}>
                              {n}
                            </div>
                          ))}
                        {hasNeg && <div>{cell.stock}</div>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}

          {/* Summary row */}
          <tr className={styles.summaryRow}>
            <td className={styles.colSizeSum} />
            <td className={styles.colOrdersSum}>{totals.sO || ''}</td>
            <td className={styles.colDeficitSum}>{totals.sD || ''}</td>
            <td className={styles.colTurnoverSum} />
            <td className={styles.colNewOrderSum}>
              <span className={styles.summaryExtra}>{totals.sE || ''}</span>
            </td>
            {months.map((month, mi) => {
              const deficit = monthlyDeficits[mi];
              return (
                <td
                  key={mi}
                  colSpan={month.span}
                  className={`${styles.monthlyDeficitCell} ${
                    mi > 0 ? styles.monthSep : ''
                  }`}
                >
                  {deficit > 0 ? `-${deficit}` : ''}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SkuGanttRow;
