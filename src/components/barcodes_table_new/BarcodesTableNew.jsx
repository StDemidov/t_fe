import React, { useState, useEffect, useRef } from 'react';
import LazyLoad from 'react-lazyload';
import { v4 as uuidv4 } from 'uuid';
import {
  format,
  startOfWeek,
  addWeeks,
  endOfWeek,
  isBefore,
  getMonth,
} from 'date-fns';
import * as XLSX from 'xlsx';

import BarcodeFilters from '../barcodes_filters/BarcodeFilters';
import { ru } from 'date-fns/locale';
import styles from './style.module.css';
import UploadOrderBarcode from '../upload_order_barcode/UploadOrderBarcode';
import DeleteOrders from '../delete_orders/DeleteOrders';
import { useDispatch, useSelector } from 'react-redux';
import { selectPage, setPageBarcode } from '../../redux/slices/barcodeSlice';
import BarplotVC from '../barplot_vc/BarplotVC';
import { selectBarcodeDatesFilter } from '../../redux/slices/filterSlice';

const getUniqueOrderNames = (data) => {
  const namesSet = new Set();

  Object.values(data).forEach((orders) => {
    orders.forEach((order) => {
      namesSet.add(order.name);
    });
  });

  return Array.from(namesSet);
};

const BarcodesTableNew = ({ data, endDate, orders, pagesNumber }) => {
  const [weeks, setWeeks] = useState([]);
  const [extraStock, setExtraStock] = useState({});
  const [months, setMonths] = useState([]);
  const tableRefs = useRef([]);
  const dispatch = useDispatch();
  const currentPage = useSelector(selectPage);
  const datesFilter = useSelector(selectBarcodeDatesFilter);

  const uniqueOrders = getUniqueOrderNames(orders);

  useEffect(() => {
    tableRefs.current = tableRefs.current.slice(0, data.length + 1);
  }, [data]);

  const handleScroll = (sourceIndex) => {
    const sourceTable = tableRefs.current[sourceIndex];
    if (!sourceTable) return;

    const scrollLeft = sourceTable.scrollLeft;
    tableRefs.current.forEach((table, index) => {
      if (index !== sourceIndex && table) {
        table.scrollLeft = scrollLeft;
      }
    });
  };
  console.log(currentPage);

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
        start: format(new Date(start), 'dd'),
        end: format(new Date(weekEnd), 'dd'),
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
    if (orderAmounts.length > 0) return styles.cellPurple;
    if (extraAdded > 0) return styles.cellBlue;
    if (stock >= forecast) return styles.cellGreen;
    if (stock > 0) return styles.cellYellow;

    return styles.cellRed;
  };

  const handleExtraStockChange = (barcode, value) => {
    setExtraStock((prev) => ({ ...prev, [barcode]: Number(value) || 0 }));
  };

  const generateXLS = () => {
    const filteredData = Object.entries(extraStock)
      .filter(([_, value]) => value > 0)
      .map(([barcode, value]) => ({ Баркод: barcode, Количество: value }));

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Заказ');
    XLSX.writeFile(workbook, 'заказ.xlsx');
    setExtraStock({});
  };

  const handleClickOnPage = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    dispatch(setPageBarcode(id));
  };

  const pagesArray = [];
  for (let i = 1; i <= pagesNumber; i++) {
    pagesArray.push(i);
  }

  var sumExtra = 0;
  for (var key in extraStock) {
    sumExtra += extraStock[key];
  }
  return (
    <div>
      <div className={styles.headerBlock}>
        <div className={styles.headerFiltersButtons}>
          <div className={styles.filters}>
            <BarcodeFilters />
          </div>
          <div className={styles.actionButtons}>
            <UploadOrderBarcode existingOrders={uniqueOrders} />
            <DeleteOrders existingOrders={uniqueOrders} />
            <button className={styles.actionButton} onClick={generateXLS}>
              Сформировать заказ
            </button>
          </div>
        </div>
        <div className={styles.paginator}>
          {pagesArray.map((elem) => (
            <div
              className={`${styles.pageIcon} ${
                elem == currentPage ? styles.currentPage : ''
              }`}
              onClick={handleClickOnPage}
              data-value={elem}
            >
              {elem}
            </div>
          ))}
        </div>
        <div className={styles.header}>
          <div className={styles.leftHeaderPart}>
            <div>Информация по артикулам</div>
          </div>
          <div
            className={styles.tableWrapper}
            ref={(el) => (tableRefs.current[0] = el)}
            onScroll={() => handleScroll(0)}
          >
            <table className={styles.ganttTable}>
              <thead>
                <tr>
                  <th className={styles.barcodeColumn} rowSpan={2}>
                    Размер
                  </th>
                  <th className={styles.ordersColumn} rowSpan={2}>
                    Заказы
                  </th>
                  <th className={styles.remainingColumn} rowSpan={2}>
                    Дефицит
                  </th>
                  <th rowSpan={2} className={styles.newOrderColumn}>
                    Сумма новых заказов:
                    <br />
                    <div className={styles.sumOrderDiv}>{sumExtra}</div>
                  </th>
                  {months.map((month, index) => (
                    <th
                      key={index}
                      colSpan={month.span}
                      className={styles.monthHeader}
                    >
                      {month.name}
                    </th>
                  ))}
                </tr>
                <tr>
                  {weeks.map((week, index) => (
                    <th key={index} className={styles.cell}>
                      {week.start} - {week.end}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
        </div>
      </div>
      {data.map((vc, index) => {
        let sumOrders = 0;
        let sumExtraOrder = 0;
        let sumRemaining = 0;
        return (
          <div className={styles.artBlock} key={index}>
            <div className={styles.artInfo}>
              <div className={styles.infoBlock}>
                <div>Себес. без НДС: {vc.selfPrice} руб.</div>
                <LazyLoad key={uuidv4()} offset={100}>
                  <div className={styles.ordersPlot}>
                    <BarplotVC data={vc.orders} dates={datesFilter} />
                    <div
                      className={styles.summary}
                      style={
                        vc.ordersSum
                          ? { display: 'block' }
                          : { display: 'none' }
                      }
                    >
                      Заказы
                      <br />
                      Итого: {vc.ordersSum.toLocaleString()}
                    </div>
                  </div>
                </LazyLoad>
              </div>
              <div className={styles.imageBlock}>
                <img src={vc.image} alt="Фото" className={styles.zoomImage} />
                <div className={styles.abcCategory}>{vc.abc}</div>
              </div>
            </div>
            <div
              className={styles.tableWrapper}
              ref={(el) => (tableRefs.current[index + 1] = el)}
              onScroll={() => handleScroll(index + 1)}
            >
              <table className={styles.ganttTable}>
                <tbody>
                  {vc.barcodes.map(
                    ({ barcode, stock, forecasts, size }, index) => {
                      let remainingStock = stock;
                      let extraRemaining = extraStock[barcode] || 0;
                      const barcodeOrders = orders[barcode] || [];
                      let orderIndex = 0;
                      let stockUsed = false;
                      let extraUsed = false;
                      let stockPushed = false;
                      let prevOrder = null;
                      sumOrders += orders[barcode]
                        ? Math.round(
                            orders[barcode]?.reduce(
                              (total, next) => total + next.amount,
                              0
                            )
                          )
                        : 0;

                      let lastCellValue = '';
                      weeks.forEach((_, i) => {
                        const forecast = forecasts[i] || 0;
                        let orderAmounts = [];

                        while (
                          orderIndex < barcodeOrders.length &&
                          remainingStock < forecast
                        ) {
                          const order = barcodeOrders[orderIndex];
                          if (order.amount > 0) {
                            orderAmounts.push(order.name);
                            prevOrder = order.name;
                            remainingStock += order.amount;
                            stockUsed = true;
                          }
                          orderIndex++;
                        }

                        let extraAdded = 0;
                        if (remainingStock < forecast && extraRemaining > 0) {
                          extraAdded = Math.min(
                            extraRemaining,
                            forecast - remainingStock
                          );
                          extraUsed = true;
                          remainingStock += extraAdded;
                          extraRemaining -= extraAdded;
                        }
                        remainingStock -= forecast;
                        lastCellValue = orderAmounts.length
                          ? orderAmounts.join(', ')
                          : remainingStock < 0
                          ? remainingStock
                          : '';
                      });

                      sumRemaining += lastCellValue ? lastCellValue : 0;

                      remainingStock = stock;
                      extraRemaining = extraStock[barcode] || 0;
                      orderIndex = 0;
                      stockUsed = false;
                      extraUsed = false;
                      stockPushed = false;
                      prevOrder = null;

                      return (
                        <tr key={index}>
                          <td className={styles.barcodeColumn}>{size}</td>
                          <td className={styles.ordersColumn}>
                            {orders[barcode]
                              ? Math.round(
                                  orders[barcode]?.reduce(
                                    (total, next) => total + next.amount,
                                    0
                                  )
                                )
                              : 0}
                          </td>
                          <td className={styles.remainingColumn}>
                            {-lastCellValue}
                          </td>
                          <td className={styles.newOrderColumn}>
                            <input
                              type="number"
                              value={extraStock[barcode] || ''}
                              onChange={(e) =>
                                handleExtraStockChange(barcode, e.target.value)
                              }
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

                            if (
                              remainingStock < forecast &&
                              extraRemaining > 0
                            ) {
                              extraAdded = Math.min(
                                extraRemaining,
                                forecast - remainingStock
                              );
                              extraUsed = true;
                              remainingStock += extraAdded;
                              extraRemaining -= extraAdded;
                              cellClass = styles.cellBlue;
                            }

                            if (stockUsed) {
                              if (!stockPushed && remainingStock >= forecast) {
                                if (!extraUsed) {
                                  orderAmounts.push(prevOrder);
                                  cellClass = styles.cellPurple;
                                }
                              }
                            }
                            remainingStock -= forecast;
                            return (
                              <td key={i} className={cellClass}>
                                {orderAmounts.map((name, idx) => (
                                  <div key={idx}>{name}</div>
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
                    }
                  )}
                  <tr>
                    <td className={styles.barcodeColumn}></td>
                    <td className={styles.ordersColumn}>{sumOrders}</td>
                    <td className={styles.remainingColumn}>{-sumRemaining}</td>
                    <td className={styles.newOrderColumn}>
                      <div className={styles.newOrderColumnPartSum}>
                        {vc.barcodes.map((barcode) => {
                          sumExtraOrder += extraStock[barcode.barcode]
                            ? extraStock[barcode.barcode]
                            : 0;
                        })}
                        {sumExtraOrder}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BarcodesTableNew;
