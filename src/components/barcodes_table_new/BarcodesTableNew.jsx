import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import LazyLoad from 'react-lazyload';
import { FaRegCopy, FaExternalLinkAlt } from 'react-icons/fa';

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

import UploadOrderBarcode from '../upload_order_barcode/UploadOrderBarcode';
import DeleteOrders from '../delete_orders/DeleteOrders';
import { useDispatch, useSelector } from 'react-redux';
import { selectPage, setPageBarcode } from '../../redux/slices/barcodeSlice';
import { selectBarcodeDatesFilter } from '../../redux/slices/filterSlice';
import BarplotOrdersDouble from '../barplot_orders_double/BarplotOrdersDouble';
import LineplotVC from '../lineplot_vc/LineplotVC';

import styles from './style.module.css';

const getUniqueOrderNames = (data) => {
  const namesSet = new Set();

  Object.values(data).forEach((orders) => {
    orders.forEach((order) => {
      namesSet.add(order.name);
    });
  });

  return Array.from(namesSet);
};

const predefinedColors = [
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
];

const colorsNames = {
  '#FF0000': 'Красный',
  '#00FF00': 'Зеленый',
  '#0000FF': 'Синий',
  '#FFFF00': 'Желтый',
  '#FF00FF': 'Розовый',
  '#00FFFF': 'Голубой',
};

const BarcodesTableNew = ({
  fullData,
  data,
  endDate,
  orders,
  pagesNumber,
  selectedColors,
  setSelectedColors,
}) => {
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

  const handleColorSelect = (vcName, color) => {
    setSelectedColors((prev) => ({ ...prev, [vcName]: color }));
  };

  const generateXLS = () => {
    const sheetsData = {};

    Object.entries(extraStock).forEach(([barcode, value]) => {
      if (value > 0) {
        const vc = fullData.find((vc) =>
          vc.barcodes.some((bc) => bc.barcode === barcode)
        );
        const color = colorsNames[selectedColors[vc?.vcName]] || 'Без цвета';

        if (!sheetsData[color]) {
          sheetsData[color] = [];
        }

        sheetsData[color].push({ Баркод: barcode, Количество: value });
      }
    });

    const workbook = XLSX.utils.book_new();

    Object.entries(sheetsData).forEach(([sheetName, data]) => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    XLSX.writeFile(workbook, 'заказ.xlsx');
    setExtraStock({});
  };

  const handleClickOnPage = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    dispatch(setPageBarcode(id));
  };

  const handleCopy = (event) => {
    event.stopPropagation(); // Останавливаем всплытие
    event.preventDefault(); // Предотвращаем переход по ссылке (если нужно)

    navigator.clipboard.writeText(
      event.currentTarget.getAttribute('data-value')
    );
  };

  const pagesArray = [];
  for (let i = 1; i <= pagesNumber; i++) {
    pagesArray.push(i);
  }

  var sumExtra = 0;

  data.map((vc) => {
    vc.barcodes.map((bc) => {
      for (var key in extraStock) {
        if (key === bc.barcode) {
          sumExtra += extraStock[key];
        }
      }
    });
  });

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
                    В заказе
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
            <div
              className={styles.artInfo}
              style={
                selectedColors[vc.vcName]
                  ? { border: `1px solid ${selectedColors[vc.vcName]}` }
                  : {}
              }
            >
              <div className={styles.infoBlock}>
                <div className={styles.vcName}>
                  {vc.vcName}

                  <FaRegCopy
                    size={12}
                    data-value={vc.vcName}
                    onClick={handleCopy}
                    style={{ cursor: 'pointer' }}
                    className={styles.copyIcon}
                  />
                  <Link
                    to={`/vendorcodes/${vc.id}`}
                    className={styles.linkIcon}
                    target="_blank"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <FaExternalLinkAlt />
                  </Link>
                </div>
                <div className={styles.metrics}>
                  <div className={styles.metricBox}>
                    <div className={styles.metricName}>EBITDA/день (сред)</div>{' '}
                    <div className={styles.metricValue}>{vc.ebitdaDaily} ₽</div>
                  </div>
                  <div className={styles.metricBox}>
                    <div className={styles.metricName}>EBITDA (сред)</div>{' '}
                    <div className={styles.metricValue}>{vc.ebitda} ₽</div>
                  </div>
                  <div className={styles.metricBox}>
                    <div className={styles.metricName}>Себес. без НДС</div>{' '}
                    <div className={styles.metricValue}>{vc.selfPrice} ₽</div>
                  </div>
                </div>
                <div className={styles.plotBlock}>
                  <LazyLoad key={uuidv4()} offset={100}>
                    <div className={styles.ordersPlot}>
                      Заказы и цены
                      <BarplotOrdersDouble
                        orders={vc.orders}
                        prices={vc.prices}
                        dates={datesFilter}
                      />
                      <div
                        className={styles.summary}
                        style={
                          vc.ordersSum
                            ? { display: 'block' }
                            : { display: 'none' }
                        }
                      >
                        <br />
                        Заказов: {vc.ordersSum.toLocaleString()}
                      </div>
                    </div>
                  </LazyLoad>
                  <LazyLoad key={uuidv4()} offset={100}>
                    <div className={styles.ordersPlot}>
                      СРО
                      <LineplotVC data={vc.cpo} dates={datesFilter} />
                      {/* <div
                        className={styles.summary}
                        style={
                          vc.ordersSum
                            ? { display: 'block' }
                            : { display: 'none' }
                        }
                      >
                        <br />
                        Заказов: {vc.ordersSum.toLocaleString()}
                      </div> */}
                    </div>
                  </LazyLoad>
                </div>
              </div>
              <div className={styles.imageBlock}>
                <img src={vc.image} alt="Фото" className={styles.zoomImage} />
                <div className={styles.abcCategory}>{vc.abc}</div>
                <div>
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      style={{
                        backgroundColor: color,
                        width: 12,
                        height: 12,
                        margin: 3,
                      }}
                      onClick={() => handleColorSelect(vc.vcName, color)}
                    />
                  ))}
                </div>
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
