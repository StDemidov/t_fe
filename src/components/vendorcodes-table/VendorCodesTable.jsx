import LazyLoad from 'react-lazyload';
import { Link } from 'react-router-dom';
import { PiEmptyDuotone } from 'react-icons/pi';
import { v4 as uuidv4 } from 'uuid';
import { useSelector } from 'react-redux';

import BarplotVC from '../barplot_vc/BarplotVC';
import BarplotVCRaw from '../barplot_vc_raw/BarplotVCRaw';
import LineplotVC from '../lineplot_vc/LineplotVC';
import styles from './style.module.css';

import {
  selectVCNameFilter,
  selectVCDatesFilter,
} from '../../redux/slices/filterSlice';

const VendorCodesTable = ({ data }) => {
  const vcNameFilter = useSelector(selectVCNameFilter);
  const datesFilter = useSelector(selectVCDatesFilter);

  const highlightMatch = (text, filter) => {
    if (filter.length === 0) return text;
    const regex = new RegExp(`(${filter})`, 'gi');
    return text.split(regex).map((substring, i) => {
      if (substring.toLowerCase() === filter.toLowerCase()) {
        return (
          <span key={i} className={styles.highlight}>
            {substring}
          </span>
        );
      }
      return substring;
    });
  };

  const avg_ebitda = Math.round(
    data.reduce((total, next) => total + next.ebitda, 0) / data.length
  );
  const avg_buyout = Math.round(
    data.reduce((total, next) => total + next.buyoutP, 0) / data.length
  );
  const avg_price_b_spp = Math.round(
    data.reduce((total, next) => total + next.priceBeforeDisc.at(-1), 0) /
      data.length
  );
  const avgCostPerOrder = Math.round(
    data.reduce((total, next) => total + next.costPerOrderAVG, 0) / data.length
  );
  const avg_price_ssp = Math.round(
    data.reduce((total, next) => total + next.lastPriceASpp, 0) / data.length
  );
  const avg_self_price = Math.round(
    data.reduce((total, next) => total + next.selfPrice, 0) / data.length
  );

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.table}>
        <div className={styles.colForHiding}></div>
        <div className={`${styles.row} ${styles.tableHeader}`}>
          <div className={`${styles.cell} ${styles.fixedColumn}`} />
          <div className={styles.cell}>Артикул</div>
          <div className={styles.cell}>
            <abbr title={'Количество заказанного товара на дату, не продажи.'}>
              Заказы
            </abbr>
          </div>
          <div className={styles.cell}>
            <abbr
              title={
                'Количество выкупов на дату. Не связано по датам с заказами, т.к. в одну дату может быть выкуплен товар с разными датами Заказа. Голубые столбики - не точные продажи, полученные НЕ из отчета по реализации. Фиолетовые - продажи полученные из отчета по реализации.'
              }
            >
              Выкупы
            </abbr>
          </div>
          <div className={styles.cell}>
            <abbr
              title={
                'Количество товара на складе ВБ на момент 4 утра текущего дня.'
              }
            >
              Остатки WB
            </abbr>
          </div>
          <div className={styles.cell}>
            <abbr
              title={
                'Количество товара на Моем Складе на момент 4 утра текущего дня.'
              }
            >
              Остаток МС
            </abbr>
          </div>
          <div className={styles.cell}>
            <abbr
              title={
                'EBITDA единицы товара за вчерашний день. Зависит от цены после СПП (которая меняется) и от себестоимости.'
              }
            >
              EBITDA
            </abbr>
          </div>
          <div className={styles.cell}>
            <abbr title={'EBITDA единицы товара * на количество выкупов.'}>
              EBITDA/День
            </abbr>
          </div>
          <div className={styles.cell}>
            <abbr
              title={
                'Сумма трат по всем кампаниям, запущенных на данный артикул.'
              }
            >
              Расходы на РК.ВБ
            </abbr>
          </div>
          <div className={styles.cell}>
            <abbr
              title={
                'Сумма трат по всем кампаниям, запущенных на данный артикул / на количество заказов.'
              }
            >
              CPO
            </abbr>
          </div>
          <div className={styles.cell}>
            <abbr
              title={
                'Средний процент выкупа за последние две недели, не считая предыдущую. Для новых товаров указывается средний процент выкупа по категории (по данным MPSTAT).'
              }
            >
              % Выкупа{' '}
            </abbr>
          </div>
          <div className={styles.cell}>
            <abbr title={'Цена со скидкой продавца, но без учета СПП.'}>
              Цена до СПП
            </abbr>
          </div>
          <div className={styles.cell}>
            <abbr title={'Цена c учетом СПП на текущий момент.'}>
              Цена после СПП
            </abbr>
          </div>
          <div className={styles.cell}>
            <abbr
              title={
                'Себестоимость товара - услуги без НДС + ткань с НДС + косты. Данные тянутся из таблицы СЕБЕСТОИМОСТЬ.'
              }
            >
              Себестоимость
            </abbr>
          </div>
          <div className={styles.cell}>
            <abbr
              title={
                'Остатки на складе WB, деленные на среднее количество заказов за последние 7 дней.'
              }
            >
              Оборачиваемость WB
            </abbr>
          </div>
        </div>
        {data.map((vc) => {
          return (
            <div className={styles.row} key={vc.id}>
              <div className={`${styles.cell} ${styles.fixedColumn}`}>
                <div className={styles.imageBlock}>
                  <div className={styles.abc}>
                    <div className={styles.abcText}>{vc.abcCurrent}</div>
                  </div>
                  <div className={styles.imageSmall}>
                    <LazyLoad display="none" key={uuidv4()} overflow>
                      {vc.image ? (
                        <img
                          src={vc.image}
                          className={styles.zoomImage}
                          alt="Фото"
                        />
                      ) : (
                        'Фото'
                      )}
                    </LazyLoad>
                  </div>
                </div>
              </div>
              <Link
                className={`${styles.cell} ${styles.vcCell}`}
                to={`/vendorcodes/${vc.id}`}
                target="_blank"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div data-value={vc.id}>
                  {highlightMatch(vc.vendorCode, vcNameFilter)}
                </div>
              </Link>
              <div className={styles.cell}>
                <LazyLoad key={uuidv4()} offset={100}>
                  <div>
                    <BarplotVC data={vc.wbOrdersTotal} dates={datesFilter} />
                    <div
                      className={styles.summary}
                      style={
                        vc.ordersSum
                          ? { display: 'block' }
                          : { display: 'none' }
                      }
                    >
                      Итого: {vc.ordersSum.toLocaleString()}
                    </div>
                  </div>
                </LazyLoad>
              </div>
              <div className={styles.cell}>
                <LazyLoad key={uuidv4()} offset={100}>
                  <div>
                    <BarplotVCRaw
                      data={vc.sales}
                      raw_data={vc.rawSales}
                      dates={datesFilter}
                    />
                    <div
                      className={styles.summary}
                      style={
                        vc.salesSum ? { display: 'block' } : { display: 'none' }
                      }
                    >
                      Итого: {vc.salesSum.toLocaleString()}
                    </div>
                  </div>
                </LazyLoad>
              </div>
              <div className={styles.cell}>
                <LazyLoad key={uuidv4()} offset={100}>
                  <div>
                    <BarplotVC data={vc.wbStocksTotal} dates={datesFilter} />
                    <div
                      className={styles.summary}
                      style={
                        getSum(vc.lastWBstock)
                          ? { display: 'block' }
                          : { display: 'none' }
                      }
                    >
                      Текущие: {vc.lastWBstock.at(-1).toLocaleString()}
                    </div>
                  </div>
                </LazyLoad>
              </div>
              <div className={styles.cell}>
                {vc.msTotal === 0 ? <PiEmptyDuotone color="red" /> : vc.msTotal}
              </div>
              <div className={styles.cell}>{vc.ebitda} ₽</div>
              <div className={styles.cell}>
                <LazyLoad key={uuidv4()} offset={100}>
                  <div>
                    <BarplotVCRaw
                      data={vc.dailyEbitda}
                      raw_data={vc.rawDailyEbitda}
                      dates={datesFilter}
                    />
                    <div
                      className={styles.summary}
                      style={
                        vc.debSum ? { display: 'block' } : { display: 'none' }
                      }
                    >
                      Итого: {vc.debSum.toLocaleString()}
                    </div>
                  </div>
                </LazyLoad>
              </div>
              <div className={styles.cell}>
                <LazyLoad key={uuidv4()} offset={100}>
                  <div>
                    <LineplotVC data={vc.adsCosts} dates={datesFilter} />
                    <div
                      className={styles.summary}
                      style={
                        vc.adsCostsSum
                          ? { display: 'block' }
                          : { display: 'none' }
                      }
                    >
                      <div
                        className={styles.summary}
                        style={
                          vc.adsCostsSum
                            ? { display: 'block' }
                            : { display: 'none' }
                        }
                      >
                        Итого: {vc.adsCostsSum.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </LazyLoad>
              </div>
              <div className={styles.cell}>
                <LazyLoad key={uuidv4()} offset={100}>
                  <div>
                    <BarplotVC data={vc.costPerOrder} dates={datesFilter} />
                    <div
                      className={styles.summary}
                      style={
                        vc.costPerOrderAVG
                          ? { display: 'block' }
                          : { display: 'none' }
                      }
                    >
                      Среднее: {vc.costPerOrderAVG} ₽
                    </div>
                  </div>
                </LazyLoad>
              </div>
              <div className={styles.cell}>{vc.buyoutP} %</div>
              <div className={styles.cell}>
                <LazyLoad key={uuidv4()} offset={100}>
                  <div>
                    <LineplotVC data={vc.priceBeforeDisc} dates={datesFilter} />
                    <div
                      className={styles.summary}
                      style={
                        vc.priceBeforeDisc.at(-1)
                          ? { display: 'block' }
                          : { display: 'none' }
                      }
                    >
                      Последняя: {vc.priceBeforeDisc.at(-1).toLocaleString()} ₽
                    </div>
                  </div>
                </LazyLoad>
              </div>
              <div className={styles.cell}>
                {vc.lastPriceASpp === 0 ? (
                  <PiEmptyDuotone color="red" />
                ) : (
                  vc.lastPriceASpp
                )}{' '}
                {vc.lastPriceASpp === 0 ? '' : '₽'}
              </div>
              <div className={styles.cell}>{vc.selfPrice} ₽</div>
              <div className={styles.cell}>
                {vc.turnoverWB === 0 ? (
                  <PiEmptyDuotone color="red" />
                ) : (
                  vc.turnoverWB
                )}
              </div>
            </div>
          );
        })}
        <div className={`${styles.row} ${styles.tableFooter}`}>
          <div className={`${styles.cell} ${styles.fixedColumn}`} />
          <div className={styles.cell}></div>
          <div className={styles.cell}>
            {data
              .reduce((n, { ordersSum }) => n + ordersSum, 0)
              .toLocaleString()}
          </div>
          <div className={styles.cell}>
            {data.reduce((n, { salesSum }) => n + salesSum, 0).toLocaleString()}
          </div>
          <div className={styles.cell}>
            {data
              .reduce((n, { lastWBstock }) => n + lastWBstock.at(-1), 0)
              .toLocaleString()}
          </div>
          <div className={styles.cell}>
            {data.reduce((n, { msTotal }) => n + msTotal, 0).toLocaleString()}
          </div>
          <div className={styles.cell}>
            {avg_ebitda.toLocaleString() ? avg_ebitda : 0} ₽
          </div>
          <div className={styles.cell}>
            {data.reduce((n, { debSum }) => n + debSum, 0).toLocaleString()} ₽
          </div>
          <div className={styles.cell}>
            {data
              .reduce((n, { adsCostsSum }) => n + adsCostsSum, 0)
              .toLocaleString()}{' '}
            ₽
          </div>
          <div className={styles.cell}>
            {avgCostPerOrder ? avgCostPerOrder.toLocaleString() : 0} ₽
          </div>
          <div className={styles.cell}>{avg_buyout ? avg_buyout : 0} %</div>
          <div className={styles.cell}>
            {avg_price_b_spp ? avg_price_b_spp.toLocaleString() : 0} ₽
          </div>
          <div className={styles.cell}>
            {avg_price_ssp ? avg_price_ssp.toLocaleString() : 0} ₽
          </div>
          <div className={styles.cell}>
            {avg_self_price ? avg_self_price.toLocaleString() : 0} ₽
          </div>
          <div className={styles.cell}></div>
        </div>
      </div>
    </div>
  );
};

export default VendorCodesTable;

const getSum = (data) => {
  var sumData = data.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
  return sumData;
};
