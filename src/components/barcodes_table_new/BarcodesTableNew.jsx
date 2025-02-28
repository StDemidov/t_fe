import React, { useState, useEffect } from 'react';
import {
  format,
  startOfWeek,
  addWeeks,
  endOfWeek,
  isBefore,
  getMonth,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import './styles.css';

const BarcodesTableNew = ({ barcodes, endDate, orders }) => {
  const [weeks, setWeeks] = useState([]);
  const [extraStock, setExtraStock] = useState({});
  const [months, setMonths] = useState([]);

  useEffect(() => {
    const today = new Date();
    let start = startOfWeek(today, { weekStartsOn: 1 });
    const end = new Date(endDate);
    const weekRanges = [];
    const monthLabels = [];
    let currentMonth = null;
    let monthStartIndex = 0;

    while (isBefore(start, end)) {
      const weekEnd = endOfWeek(start, { weekStartsOn: 1 });
      const month = format(start, 'MMMM', { locale: ru });

      if (month !== currentMonth) {
        if (currentMonth !== null) {
          monthLabels.push({
            name: currentMonth,
            span: weekRanges.length - monthStartIndex,
          });
        }
        currentMonth = month;
        monthStartIndex = weekRanges.length;
      }

      weekRanges.push({
        start: format(start, 'dd.MM.yyyy', { locale: ru }),
        end: format(weekEnd, 'dd.MM.yyyy', { locale: ru }),
      });
      start = addWeeks(start, 1);
    }
    monthLabels.push({
      name: currentMonth,
      span: weekRanges.length - monthStartIndex,
    });

    setWeeks(weekRanges);
    setMonths(monthLabels);
  }, [endDate]);

  const getCellClass = (stock, forecast, orderAmounts, extraAdded) => {
    if (orderAmounts.length > 0) return 'cell-purple';
    if (extraAdded > 0) return 'cell-blue';
    if (stock >= forecast) return 'cell-green';
    if (stock > 0) return 'cell-yellow';

    return 'cell-red';
  };

  const handleExtraStockChange = (barcode, value) => {
    setExtraStock((prev) => ({ ...prev, [barcode]: Number(value) || 0 }));
  };

  var sumExtra = 0;
  for (var key in extraStock) {
    sumExtra += extraStock[key];
  }

  return (
    <div className="table-wrapper">
      <table className="gantt-table">
        <thead>
          <tr>
            <th className="barcode-column" rowSpan={2}>
              Barcode
            </th>
            <th rowSpan={2}>
              Сумма заказов:
              <br />
              {sumExtra}
            </th>
            {months.map((month, index) => (
              <th key={index} colSpan={month.span} className="month-header">
                {month.name}
              </th>
            ))}
          </tr>
          <tr>
            {weeks.map((week, index) => (
              <th key={index}>
                {week.start} - {week.end}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {barcodes.map(({ barcode, stock, forecasts }, index) => {
            let remainingStock = stock;
            let extraRemaining = extraStock[barcode] || 0;
            const barcodeOrders = orders[barcode] || [];
            let orderIndex = 0;
            let stockUsed = false;
            let extraUsed = false;
            let stockPushed = false;
            let prevOrder = null;

            return (
              <tr key={index}>
                <td className="barcode-column">{barcode}</td>
                <td>
                  <input
                    type="number"
                    value={extraStock[barcode] || ''}
                    onChange={(e) =>
                      handleExtraStockChange(barcode, e.target.value)
                    }
                    className="border p-1 w-20"
                  />
                </td>
                {weeks.map((_, i) => {
                  stockPushed = false;
                  const forecast = forecasts[i] || 0;
                  let orderAmounts = [];
                  let extraAdded = 0;

                  while (
                    orderIndex < barcodeOrders.length &&
                    remainingStock < forecast
                  ) {
                    const order = barcodeOrders[orderIndex];
                    if (barcodeOrders[orderIndex].amount > 0) {
                      orderAmounts.push(order.name);
                      prevOrder = order.name;
                      remainingStock += order.amount;
                      stockUsed = true;
                      stockPushed = true;
                    }
                    orderIndex++;
                  }
                  let cellClass = getCellClass(
                    remainingStock,
                    forecast,
                    orderAmounts,
                    extraAdded
                  );

                  if (remainingStock < forecast && extraRemaining > 0) {
                    extraAdded = Math.min(
                      extraRemaining,
                      forecast - remainingStock
                    );
                    extraUsed = true;
                    remainingStock += extraAdded;
                    extraRemaining -= extraAdded;
                    cellClass = 'cell-blue';
                  }

                  if (stockUsed) {
                    if (!stockPushed && remainingStock >= forecast) {
                      if (!extraUsed) {
                        orderAmounts.push(prevOrder);
                        cellClass = 'cell-purple';
                      }
                    }
                  }
                  remainingStock -= forecast;
                  console.log(remainingStock);

                  return (
                    <td key={i} className={cellClass}>
                      {orderAmounts.map((name, idx) => (
                        <div key={idx} className={`order-${idx}`}>
                          {name}
                        </div>
                      ))}
                      {!orderAmounts.length && remainingStock < 0 ? (
                        <div>{remainingStock}</div>
                      ) : (
                        <></>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BarcodesTableNew;
