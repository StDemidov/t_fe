import LazyLoad from 'react-lazyload';
import { Link } from 'react-router-dom';
import { PiEmptyDuotone } from 'react-icons/pi';
import { v4 as uuidv4 } from 'uuid';
import { useSelector } from 'react-redux';

import BarplotVC from '../barplot_vc/BarplotVC';
import BarplotVCRaw from '../barplot_vc_raw/BarplotVCRaw';
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
    data.reduce((total, next) => total + next.ebitda.at(-1), 0) / data.length
  );
  const avg_buyout = Math.round(
    data.reduce((total, next) => total + next.buyoutP, 0) / data.length
  );
  const avg_price_b_spp = Math.round(
    data.reduce((total, next) => total + next.priceBeforeDisc.at(-1), 0) /
      data.length
  );
  const avg_price_ssp = Math.round(
    data.reduce((total, next) => total + next.lastPriceASpp, 0) / data.length
  );
  const avg_self_price = Math.round(
    data.reduce(
      (total, next) => total + next.clothCost + next.costs + next.servicesCost,
      0
    ) / data.length
  );

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.table}>
        <div className={styles.colForHiding}></div>
        <div className={`${styles.row} ${styles.tableHeader}`}>
          <div className={`${styles.cell} ${styles.fixedColumn}`} />
          <div className={styles.cell}>Артикул</div>
          <div className={styles.cell}>Заказы</div>
          <div className={styles.cell}>Выкупы</div>
          <div className={styles.cell}>Остатки WB</div>
          <div className={styles.cell}>Остаток МС</div>
          <div className={styles.cell}>EBITDA</div>
          <div className={styles.cell}>EBITDA/День</div>
          <div className={styles.cell}>% Выкупа</div>
          <div className={styles.cell}>Цена до СПП</div>
          <div className={styles.cell}>Цена после СПП</div>
          <div className={styles.cell}>Себестоимость</div>
          <div className={styles.cell}>Оборачиваемость WB</div>
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
                      Итого: {vc.ordersSum}
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
                      Итого: {vc.salesSum}
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
                      Текущие: {vc.lastWBstock.at(-1)}
                    </div>
                  </div>
                </LazyLoad>
              </div>
              <div className={styles.cell}>
                {vc.msTotal === 0 ? <PiEmptyDuotone color="red" /> : vc.msTotal}
              </div>
              <div className={styles.cell}>
                {vc.ebitda[vc.ebitda.length - 1]} ₽
              </div>
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
                      Итого: {vc.debSum}
                    </div>
                  </div>
                </LazyLoad>
              </div>
              <div className={styles.cell}>{vc.buyoutP} %</div>
              <div className={styles.cell}>
                <LazyLoad key={uuidv4()} offset={100}>
                  <div>
                    <BarplotVC data={vc.priceBeforeDisc} dates={datesFilter} />
                    <div
                      className={styles.summary}
                      style={
                        vc.priceBeforeDisc.at(-1)
                          ? { display: 'block' }
                          : { display: 'none' }
                      }
                    >
                      Последняя: {vc.priceBeforeDisc.at(-1)} ₽
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
              <div className={styles.cell}>
                {vc.clothCost + vc.costs + vc.servicesCost} ₽
              </div>
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
            {data.reduce((n, { ordersSum }) => n + ordersSum, 0)}
          </div>
          <div className={styles.cell}>
            {data.reduce((n, { salesSum }) => n + salesSum, 0)}
          </div>
          <div className={styles.cell}>
            {data.reduce((n, { lastWBstock }) => n + lastWBstock.at(-1), 0)}
          </div>
          <div className={styles.cell}>
            {data.reduce((n, { msTotal }) => n + msTotal, 0)}
          </div>
          <div className={styles.cell}>{avg_ebitda ? avg_ebitda : 0} ₽</div>
          <div className={styles.cell}>
            {data.reduce((n, { debSum }) => n + debSum, 0)} ₽
          </div>
          <div className={styles.cell}>{avg_buyout ? avg_buyout : 0} %</div>
          <div className={styles.cell}>
            {avg_price_b_spp ? avg_price_b_spp : 0} ₽
          </div>
          <div className={styles.cell}>
            {avg_price_ssp ? avg_price_ssp : 0} ₽
          </div>
          <div className={styles.cell}>
            {avg_self_price ? avg_self_price : 0} ₽
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
