import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { FaSpinner, FaEdit } from 'react-icons/fa';
import { PiEmptyDuotone } from 'react-icons/pi';
import { ImCross } from 'react-icons/im';
import { useSpring, animated } from '@react-spring/web';
import * as XLSX from 'xlsx';
import { setError } from '../../redux/slices/errorSlice';
import {
  fetchVendorCodeMetricsSingle,
  selectVendorCodeMetrics,
  selectIsLoading,
  setVendorCodeDate,
} from '../../redux/slices/vendorCodeSlice';
import { selectSingleVCDatesFilter } from '../../redux/slices/filterSlice';
import { selectNotificationMessage } from '../../redux/slices/notificationSlice';
import styles from './style.module.css';
import SingleVendorCodePlot from '../single-vendorcode-plot/SingleVendorCodePlot';
import BarplotVC from '../barplot_vc/BarplotVC';
import CategoryPlot from '../category-plot/CategoryPlot';
import SingleVCDateFilter from './single-vc-date-filter/singleVCDateFilter';
import wbLogo from './wb_logo.png';
import mpStatsLogo from './mpstats_logo.svg';
import { hostName } from '../../utils/host';

import {
  getSum,
  getAverage,
  getSumRaw,
  getDataForPeriod,
} from '../../utils/dataSlicing';

import { calculateCostPerOrder } from '../../utils/calculations';
import BarplotVCSingle from '../barplot_vc_single/BarplotVCSingle';

// SVG-иконка Excel
const ExcelIcon = ({ size = 22 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width={size}
    height={size}
    style={{ display: 'block' }}
  >
    <rect x="6" y="6" width="36" height="36" rx="4" fill="#1D6F42" />
    <text
      x="24"
      y="32"
      textAnchor="middle"
      fill="white"
      fontSize="20"
      fontWeight="bold"
      fontFamily="Arial, sans-serif"
    >
      X
    </text>
  </svg>
);

const SingleVendorCode = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const vcMetrics = useSelector(selectVendorCodeMetrics);
  const notificationMessage = useSelector(selectNotificationMessage);
  const datesFilter = useSelector(selectSingleVCDatesFilter);
  const startDate = new Date(datesFilter.start);
  const endDate = new Date(datesFilter.end);
  let { id } = useParams();

  useEffect(() => {
    if (notificationMessage == '') {
      dispatch(fetchVendorCodeMetricsSingle(`${hostName}/vendorcode/${id}`));
    }
  }, [dispatch, notificationMessage]);

  let vcData = vcMetrics.filter((vc) => {
    return vc?.id === Number(id);
  })[0];

  let sortedBarcodes = false;
  if (vcData?.barcodes) {
    sortedBarcodes = [...vcData?.barcodes];
    sortedBarcodes = sortBarcodesBySize(sortedBarcodes);
  }

  const [date, setDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const animStyles = useSpring({
    loop: false,
    from: { opacity: '0' },
    to: { opacity: '1' },
    config: { duration: '600' },
  });

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(newDate);
    if (isValidDate) {
      setDate(newDate);
      setIsEditing(false);
      dispatch(
        setVendorCodeDate(
          `${hostName}/vendorcode/${vcData?.id}/date-change?date=${newDate}`
        )
      );
    } else {
      dispatch(setError('Введите дату в формате ГГГГ-ММ-ДД'));
    }
  };

  const handleEditClick = () => {
    setDate(vcData?.dateOfAppearance);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Парсим дату как локальную (без смещения UTC)
  const parseLocalDate = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  // Форматируем дату в YYYY-MM-DD по локальному времени
  const formatLocalDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Генерация дат между startDate и endDate включительно (локальное время)
  const getDatesInRange = (start, end) => {
    const dates = [];
    const cur = parseLocalDate(start);
    const endNorm = parseLocalDate(end);
    while (cur <= endNorm) {
      dates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  };

  // Получение значения из строки данных по дате.
  // Последнее значение в массиве соответствует endDate.
  const getValueForDate = (dataStr, targetDate, refEndDate) => {
    if (!dataStr) return '';
    const arr = dataStr.split(',').map(Number);
    const refEnd = parseLocalDate(refEndDate);
    const target = parseLocalDate(targetDate);
    const diffDays = Math.round((refEnd - target) / (1000 * 60 * 60 * 24));
    const idx = arr.length - 1 - diffDays;
    if (idx < 0 || idx >= arr.length) return '';
    return arr[idx];
  };

  const handleExportXlsx = () => {
    if (!sortedBarcodes || !vcData) return;

    const dates = getDatesInRange(startDate, endDate);
    const rows = [];

    for (const barcode of sortedBarcodes) {
      for (const d of dates) {
        const dateStr = formatLocalDate(d);
        rows.push({
          Размер: barcode.size,
          Дата: dateStr,
          Остаток: getValueForDate(barcode.wb_stocks_daily, d, endDate),
          Заказы: getValueForDate(barcode.wb_orders_daily, d, endDate),
        });
      }
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Данные');
    XLSX.writeFile(wb, `${vcData?.vendorCode}.xlsx`);
  };

  return (
    <>
      {isLoading || !vcData ? (
        <FaSpinner className="spinner" />
      ) : (
        <animated.div style={{ ...animStyles }}>
          <section className={styles.sectionClass}>
            <div className={styles.vcCard}>
              <div className={styles.vcImage}>
                <div className={styles.vcName}>{vcData?.vendorCode}</div>

                {vcData?.image ? (
                  <img
                    src={vcData?.image}
                    alt="Фотография товара"
                    className={styles.vcPhoto}
                  />
                ) : (
                  <div className={styles.noImage}>?</div>
                )}
                <div className={styles.links}>
                  <a
                    href={`https://www.wildberries.ru/catalog/${vcData?.sku}/detail.aspx`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={wbLogo}
                      className={styles.linkA}
                      width="20px"
                      alt="wb"
                    />
                  </a>
                  <a
                    href={`https://mpstats.io/wb/item/${vcData?.sku}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      className={`${styles.linkA} ${styles.linkMP}`}
                      src={mpStatsLogo}
                      width="20px"
                      alt="mpstats"
                    />
                  </a>
                </div>
                <div className={styles.abcCategory}>
                  ABC:{' '}
                  <div
                    className={`${styles.abcCatBlock} ${getStyle(
                      vcData?.abcCurrent
                    )}`}
                  >
                    {vcData?.abcCurrent ? vcData?.abcCurrent : 'Новый товар'}
                  </div>
                </div>
                <div className={styles.abcCategory}>
                  ABC внутри категории:{' '}
                  <div
                    className={`${styles.abcCatBlock} ${getStyle(
                      vcData?.abcCtgryCurrent
                    )}`}
                  >
                    {vcData?.abcCtgryCurrent
                      ? vcData?.abcCtgryCurrent
                      : 'Новый товар'}
                  </div>
                </div>
              </div>
              <div className={styles.vcInfoBlock}>
                <div className={styles.datesFilterTitle}>
                  Выберите период{' '}
                  <SingleVCDateFilter className={styles.datesFilter} />
                </div>
                <div className={styles.vcInfoContainer}>
                  <div className={styles.vcInfo}>
                    <div className={styles.vcInfoLabel}>Дата появления</div>
                    <div className={styles.vcInfoItem}>
                      {isEditing ? (
                        <div className={styles.dateChangeBlock}>
                          <input
                            className={styles.dateInput}
                            type="text"
                            defaultValue={date}
                            onBlur={handleCancel}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleDateChange(e);
                              } else if (e.key === 'Escape') {
                                handleCancel();
                              }
                            }}
                            pattern="\d{4}-\d{2}-\d{2}"
                            placeholder="YYYY-MM-DD"
                            autoFocus
                          />
                          <ImCross
                            className={styles.crossButton}
                            onClick={handleCancel}
                          />
                        </div>
                      ) : (
                        <div className={styles.dateBlock}>
                          <div>{vcData?.dateOfAppearance}</div>
                          <FaEdit
                            onClick={handleEditClick}
                            className={styles.editDateButton}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.vcInfo}>
                    <div className={styles.vcInfoLabel}>Цена после СПП</div>
                    <div className={styles.vcInfoItem}>
                      ₽ {vcData?.lastPriceASpp}
                    </div>
                  </div>
                  <div className={styles.vcInfo}>
                    <div className={styles.vcInfoLabel}>Остатки WB</div>
                    <div className={styles.vcInfoItem}>
                      {vcData?.wbStocksTotal.at(-1)} шт.
                    </div>
                  </div>
                  <div className={styles.vcInfo}>
                    <div className={styles.vcInfoLabel}>Остатки МС</div>
                    <div className={styles.vcInfoItem}>
                      {vcData?.msTotal} шт.
                    </div>
                  </div>
                  <div className={styles.vcInfo}>
                    <div className={styles.vcInfoLabel}>Оборачиваемость WB</div>
                    <div className={styles.vcInfoItem}>
                      {vcData?.turnoverWB} д.
                    </div>
                  </div>
                  <div className={styles.vcInfo}>
                    <div className={styles.vcInfoLabel}>Обор-ть WB (выкуп)</div>
                    <div className={styles.vcInfoItem}>
                      {vcData?.turnoverWBBuyout} д.
                    </div>
                  </div>
                  <div className={styles.vcInfo}>
                    <div className={styles.vcInfoLabel}>Кол-во заказов</div>
                    <div className={styles.vcInfoItem}>
                      {getSum(vcData?.wbOrdersTotal, startDate, endDate)} шт.
                    </div>
                  </div>
                  <div className={styles.vcInfo}>
                    <div className={styles.vcInfoLabel}>Кол-во выкупов</div>
                    <div className={styles.vcInfoItem}>
                      {getSumRaw(
                        vcData?.sales,
                        vcData?.rawSales,
                        startDate,
                        endDate
                      )}{' '}
                      шт.
                    </div>
                  </div>
                  <div className={styles.vcInfo}>
                    <div className={styles.vcInfoLabel}>EBITDA</div>
                    <div className={styles.vcInfoItem}>
                      ₽ {vcData?.ebitda.at(-1)}
                    </div>
                  </div>
                  <div className={styles.vcInfo}>
                    <div className={styles.vcInfoLabel}>Суммарная EBITDA</div>
                    <div className={styles.vcInfoItem}>
                      ₽{' '}
                      {getSumRaw(
                        vcData?.dailyEbitda,
                        vcData?.rawDailyEbitda,
                        startDate,
                        endDate
                      )}
                    </div>
                  </div>
                  <div className={styles.vcInfo}>
                    <div className={styles.vcInfoLabel}>Затраты на РК</div>
                    <div className={styles.vcInfoItem}>
                      ₽ {getSum(vcData?.adsCosts, startDate, endDate)}
                    </div>
                  </div>
                  <div className={styles.vcInfo}>
                    <div className={styles.vcInfoLabel}>Среднее CPO</div>
                    <div className={styles.vcInfoItem}>
                      ₽{' '}
                      {getAverage(
                        calculateCostPerOrder(
                          vcData?.wbOrdersTotal,
                          vcData?.adsCosts
                        ),
                        startDate,
                        endDate
                      )}
                    </div>
                  </div>
                  <div className={styles.vcInfo}>
                    <div className={styles.vcInfoLabel}>
                      Себестоимость с НДС
                    </div>
                    <div className={styles.vcInfoItem}>
                      ₽ {vcData?.clothCost}
                    </div>
                  </div>
                  <div className={styles.vcInfo}>
                    <div className={styles.vcInfoLabel}>
                      Себестоимость без НДС
                    </div>
                    <div className={styles.vcInfoItem}>
                      ₽ {vcData?.servicesCost}
                    </div>
                  </div>
                  <div className={styles.vcInfo}>
                    <div className={styles.vcInfoLabel}>Процент выкупа</div>
                    <div className={styles.vcInfoItem}>{vcData?.buyoutP} %</div>
                  </div>
                </div>
                <div className={styles.vcChart}>
                  <SingleVendorCodePlot vcData={vcData} dates={datesFilter} />
                </div>
              </div>
            </div>
          </section>
          <section className={styles.sectionClass}>
            <div className={styles.vcBarcodes}>
              <div className={styles.headerRow}>
                <div className={styles.headerCell}>Размер</div>
                <div className={styles.headerCell}>Заказы</div>
                <div className={styles.headerCell}>Остатки</div>
                <div className={styles.headerCell}>Остаток МС</div>
                <div className={styles.headerCell}>Обор-ть WB</div>
                <div className={styles.headerCell}>Обор-ть общая</div>
                <div className={styles.headerCellIcon}>
                  <button
                    onClick={handleExportXlsx}
                    title="Выгрузить в Excel"
                    className={styles.excelButton}
                  >
                    <ExcelIcon size={22} />
                  </button>
                </div>
              </div>
              <div className={styles.tblContent}>
                {sortedBarcodes ? (
                  sortedBarcodes.map((barcode) => {
                    return (
                      <div className={styles.barcodeRow} key={uuidv4()}>
                        <div
                          className={`${styles.barcodeCell} ${styles.sizeCell}`}
                        >
                          <span>{barcode.size}</span>
                        </div>
                        <div className={styles.barcodeCell}>
                          <div className={styles.barcodePlot}>
                            <BarplotVCSingle
                              data={barcode.wb_orders_daily
                                .split(',')
                                .map(Number)}
                              dates={datesFilter}
                            />
                            <div
                              className={styles.summary}
                              style={
                                getSum(
                                  barcode.wb_orders_daily
                                    .split(',')
                                    .map(Number),
                                  startDate,
                                  endDate
                                )
                                  ? { display: 'block' }
                                  : { display: 'none' }
                              }
                            >
                              Итого:{' '}
                              {getSum(
                                barcode.wb_orders_daily.split(',').map(Number),
                                startDate,
                                endDate
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={styles.barcodeCell}>
                          <div className={styles.barcodePlot}>
                            <BarplotVCSingle
                              data={barcode.wb_stocks_daily
                                .split(',')
                                .map(Number)}
                              dates={datesFilter}
                            />
                            <div
                              className={styles.summary}
                              style={
                                getDataForPeriod(
                                  barcode.wb_stocks_daily
                                    .split(',')
                                    .map(Number),
                                  startDate,
                                  endDate
                                ).at(-1)
                                  ? { display: 'block' }
                                  : { display: 'none' }
                              }
                            >
                              Последние:{' '}
                              {getDataForPeriod(
                                barcode.wb_stocks_daily.split(',').map(Number),
                                startDate,
                                endDate
                              ).at(-1)}
                            </div>
                          </div>
                        </div>
                        <div className={styles.barcodeCell}>
                          {barcode.ms_stocks_last === 0 ? (
                            <PiEmptyDuotone color="red" />
                          ) : (
                            `${barcode.ms_stocks_last}`
                          )}
                        </div>
                        <div className={styles.barcodeCell}>
                          {barcode.turnover_wb ? barcode.turnover_wb : 0}
                        </div>
                        <div className={styles.barcodeCell}>
                          {barcode.turnover_total ? barcode.turnover_total : 0}
                        </div>
                        <div className={styles.barcodeCellIcon} />
                      </div>
                    );
                  })
                ) : (
                  <></>
                )}
              </div>
            </div>
          </section>
          <section className={styles.sectionClass}>
            <div className={styles.vcCategory}>
              <div className={styles.chartCategory}>
                <CategoryPlot
                  graphData={vcData?.seasonalCoefs}
                  label="Значение коэффициента сезонности"
                  y_text="Коэффициент сезонности"
                  startDate1={vcData?.startDate1}
                  endDate1={vcData?.endDate1}
                  startDate2={vcData?.startDate2}
                  endDate2={vcData?.endDate2}
                />
              </div>
              <div className={styles.chartCategory}>
                <CategoryPlot
                  graphData={vcData?.priceCoefs}
                  label="Значение коэффициента цены"
                  y_text="Коэффициент цены"
                  startDate1={vcData?.startDate1}
                  endDate1={vcData?.endDate1}
                  startDate2={vcData?.startDate2}
                  endDate2={vcData?.endDate2}
                />
              </div>
            </div>
          </section>
        </animated.div>
      )}
    </>
  );
};

export default SingleVendorCode;

const getStyle = (category) => {
  switch (category) {
    case 'AAA':
      return styles.aaaCat;
    case 'A':
      return styles.aaaCat;
    case 'B':
      return styles.bCat;
    case 'BC30':
      return styles.bCat;
    case 'C':
      return styles.cCat;
    case 'BC10':
      return styles.cCat;
    case 'G':
      return styles.gCat;
    default:
      return styles.defaultCat;
  }
};

function sortBarcodesBySize(barcodes) {
  const sizeOrder = [
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    '4XL',
    'XS/155',
    'XS/175',
    'S/155',
    'S/175',
    'M/155',
    'M/175',
    'L/155',
    'L/175',
    'XL/155',
    'XXL/175',
  ];
  return barcodes.sort((a, b) => {
    const indexA = sizeOrder.indexOf(a.size);
    const indexB = sizeOrder.indexOf(b.size);
    return (
      (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB)
    );
  });
}
