import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSpinner, FaEdit } from 'react-icons/fa';
import { PiEmptyDuotone } from 'react-icons/pi';
import { ImCross } from 'react-icons/im';
import { useSpring, animated } from '@react-spring/web';
import { setError } from '../../redux/slices/errorSlice';
import {
  fetchVendorCodeMetrics,
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

const SingleVendorCode = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const vcMetrics = useSelector(selectVendorCodeMetrics);
  const notificationMessage = useSelector(selectNotificationMessage);
  const navigation = useNavigate();
  const datesFilter = useSelector(selectSingleVCDatesFilter);
  const startDate = new Date(datesFilter.start);
  const endDate = new Date(datesFilter.end);
  let { id } = useParams();

  useEffect(() => {
    if (notificationMessage == '') {
      dispatch(fetchVendorCodeMetrics(`${hostName}/vendorcode/${id}`));
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
  //

  const [date, setDate] = useState(''); // начальная дата
  const [isEditing, setIsEditing] = useState(false);

  const animStyles = useSpring({
    loop: false,
    from: { opacity: '0' },
    to: { opacity: '1' },
    config: { duration: '600' },
  });

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(newDate); // проверка формата ГГГГ-ММ-ДД
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

  // Функция для переключения режима редактирования
  const handleEditClick = () => {
    setDate(vcData?.dateOfAppearance);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
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
                <div className={styles.abcCategory}>
                  Категория:{' '}
                  <div
                    className={`${styles.abcCatBlock} ${getStyle(
                      vcData?.abcCurrent
                    )}`}
                  >
                    {vcData?.abcCurrent ? vcData?.abcCurrent : 'Новый товар'}
                  </div>
                </div>

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
                      href={`https://www.wildberries.ru/catalog/${vcData?.sku}/detail.aspx`}
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
                      alt="wb"
                    />
                  </a>
                </div>
              </div>
              <div className={styles.vcInfoBlock}>
                <div className={styles.datesFilterTitle}>
                  Выберите период{' '}
                  <SingleVCDateFilter className={styles.datesFilter} />
                </div>
                <div className={styles.vcInfoContainer}>
                  <div className={styles.vcInfo}>
                    <div className={styles.vcInfoLabel}> Дата появления</div>
                    <div className={styles.vcInfoItem}>
                      {isEditing ? (
                        <div className={styles.dateChangeBlock}>
                          <input
                            className={styles.dateInput}
                            type="text"
                            defaultValue={date}
                            onBlur={handleCancel} // отмена при выходе из поля ввода
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleDateChange(e); // сохранение при нажатии Enter
                              } else if (e.key === 'Escape') {
                                handleCancel(); // отмена при нажатии Escape
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
                    <div className={styles.vcInfoLabel}> Цена после СПП</div>
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
                    <div className={styles.vcInfoLabel}>Себестоимость</div>
                    <div className={styles.vcInfoItem}>
                      ₽{' '}
                      <abbr
                        title={`Ткань (c НДС): ${vcData?.clothCost} ₽\nУслуги: ${vcData?.servicesCost} ₽\nКосты: ${vcData?.costs} ₽`}
                      >
                        {vcData?.clothCost +
                          vcData?.costs +
                          vcData?.servicesCost}
                      </abbr>
                    </div>
                  </div>
                  <div className={styles.vcInfo}>
                    <div className={styles.vcInfoLabel}>Цена доставки</div>
                    <div className={styles.vcInfoItem}>
                      ₽ {vcData?.deliveryCost ? vcData?.deliveryCost : 0}
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
                            <BarplotVC
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
                            <BarplotVC
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

const getSum = (data, startDate, endDate) => {
  const currData = getDataForPeriod(data, startDate, endDate);
  var sumData = currData.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
  return sumData;
};

const getSumRaw = (data, raw_data, startDate, endDate) => {
  const currData = getDataForPeriodRaw(data, raw_data, startDate, endDate);
  var sumData = currData.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
  return sumData;
};

const getDataForPeriod = (data, startDate, endDate) => {
  const todayDate = new Date();
  const startIndex = Math.ceil((todayDate - startDate) / (1000 * 60 * 60 * 24)); // Индекс начала
  const endIndex = Math.floor((todayDate - endDate) / (1000 * 60 * 60 * 24)); // Индекс конца
  // Проверяем, что индексы в пределах массива
  if (startIndex < 0 || endIndex >= data.length || startIndex < endIndex) {
    throw new Error('Период выходит за пределы массива');
  }
  // Извлекаем данные за указанный период
  if (endIndex === 1) {
    return data.slice(-startIndex + 1);
  }
  return data.slice(-startIndex + 1, -endIndex + 1);
};
const getDataForPeriodRaw = (data, raw_data, startDate, endDate) => {
  const todayDate = new Date();
  const startIndex = Math.ceil((todayDate - startDate) / (1000 * 60 * 60 * 24)); // Индекс начала
  const endIndex = Math.floor((todayDate - endDate) / (1000 * 60 * 60 * 24)); // Индекс конца
  if (startIndex <= raw_data.length + 1 && endIndex <= raw_data.length + 1) {
    if (endIndex === 1) {
      return raw_data.slice(-startIndex + 1);
    }
    return raw_data.slice(-startIndex + 1, -endIndex + 1);
  } else if (
    startIndex > raw_data.length + 1 &&
    endIndex > raw_data.length + 1
  ) {
    return data.slice(
      -startIndex + raw_data.length + 1,
      -endIndex + raw_data.length + 1
    ); // Используем reverse(), чтобы вернуть порядок
  } else if (
    startIndex > raw_data.length + 1 &&
    endIndex <= raw_data.length + 1
  ) {
    if (endIndex === 1) {
      return data.slice(-startIndex + raw_data.length + 1).concat(raw_data);
    }
  }
  return data
    .slice(-startIndex + raw_data.length + 1)
    .concat(raw_data.slice(0, -endIndex + 1));
};

function sortBarcodesBySize(barcodes) {
  const sizeOrder = [
    'XS',
    'S',
    'L',
    'M',
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

    // Если размер не найден в sizeOrder, помещаем его в конец
    return (
      (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB)
    );
  });
}
