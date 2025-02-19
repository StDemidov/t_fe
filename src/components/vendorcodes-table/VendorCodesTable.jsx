import LazyLoad from 'react-lazyload';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useSelector } from 'react-redux';
import { useRef } from 'react';

import styles from './style.module.css';

import {
  selectVCNameFilter,
  selectVCDatesFilter,
} from '../../redux/slices/filterSlice';

import TagsCell from '../tags_cell/TagsCell';
import { selectAvailableTags } from '../../redux/slices/vendorCodeSlice';

import HeaderTags from './cells/header/HeaderTags';
import HeaderCPO from './cells/header/HeaderCPO';
import HeaderCPS from './cells/header/HeaderCPS';
import HeaderOrders from './cells/header/HeaderOrders';
import HeaderSales from './cells/header/HeaderSales';
import HeaderWBStocks from './cells/header/HeaderWBStocks';
import HeaderMSStocks from './cells/header/HeaderMSStocks';
import HeaderEbitda from './cells/header/HeaderEbitda';
import HeaderDailyEbitda from './cells/header/HeaderDailyEbitda';
import HeaderDailyEbitdaWOAds from './cells/header/HeaderDailyEbitdaWOAds';
import HeaderADSCosts from './cells/header/HeaderADSCosts';
import HeaderBuyout from './cells/header/HeaderBuyout';
import HeaderSelfPrice from './cells/header/HeaderSelfPrice';
import HeaderPriceBSPP from './cells/header/HeaderPriceBSPP';
import HeaderPriceASPP from './cells/header/HeaderPriceASPP';
import HeaderSelfPriceWONDS from './cells/header/HeaderSelfPriceWONDS';
import HeaderTurnover from './cells/header/HeaderTurnover';
import HeaderAddToCart from './cells/header/HeaderAddToCart';
import HeaderCartToOrder from './cells/header/HeaderCartToOrder';
import HeaderClickToOrder from './cells/header/HeaderClickToOrder';

import BodyOrders from './cells/body/BodyOrders';
import BodySales from './cells/body/BodySales';
import BodyWBStocks from './cells/body/BodyWBStocks';
import BodyMSStocks from './cells/body/BodyMSStocks';
import BodyEbitda from './cells/body/BodyEbitda';
import BodyDailyEbitda from './cells/body/BodyDailyEbitda';
import BodyDailyEbitdaWOAds from './cells/body/BodyDailyEbitdaWOAds';
import BodyADSCosts from './cells/body/BodyADSCosts';
import BodyCPO from './cells/body/BodyCPO';
import BodyCPS from './cells/body/BodyCPS';
import BodyBuyout from './cells/body/BodyBuyout';
import BodyPriceBSPP from './cells/body/BodyPriceBSPP';
import BodyPriceASPP from './cells/body/BodyPriceASPP';
import BodySelfPrice from './cells/body/BodySelfPrice';
import BodySelfPriceWONDS from './cells/body/BodySelfPriceWONDS';
import BodyTurnover from './cells/body/BodyTurnover';

import FooterTags from './cells/footer/FooterTags';
import FooterOrders from './cells/footer/FooterOrders';
import FooterSales from './cells/footer/FooterSales';
import FooterADSCosts from './cells/footer/FooterADSCosts';
import FooterBuyout from './cells/footer/FooterBuyout';
import FooterCPO from './cells/footer/FooterCPO';
import FooterCPS from './cells/footer/FooterCPS';
import FooterDailyEbitda from './cells/footer/FooterDailyEbitda';
import FooterDailyEbitdaWOAds from './cells/footer/FooterDailyEbitdaWOAds';
import FooterEbitda from './cells/footer/FooterEbitda';
import FooterMSStocks from './cells/footer/FooterMSStocks';
import FooterPriceASPP from './cells/footer/FooterPriceASPP';
import FooterPriceBSPP from './cells/footer/FooterPriceBSPP';
import FooterSelfPrice from './cells/footer/FooterSelfPrice';
import FooterSelfPriceWONDS from './cells/footer/FooterSelfPriceWONDS';
import FooterTurnover from './cells/footer/FooterTurnover';
import FooterWBStocks from './cells/footer/FooterWBStocks';

const сolRender = {
  tags: {
    render: (vc, availableTags, tableRef) => (
      <TagsCell
        tags={vc.tags}
        availableTags={availableTags}
        skuId={vc.id}
        tableRef={tableRef}
        key={uuidv4()}
      />
    ),
    renderHeader: () => <HeaderTags key={uuidv4()} />,
    renderFooter: () => <FooterTags key={uuidv4()} />,
  },
  orders: {
    render: (vc, datesFilter) => (
      <BodyOrders vc={vc} datesFilter={datesFilter} key={uuidv4()} />
    ),
    renderHeader: () => <HeaderOrders key={uuidv4()} />,
    renderFooter: (data) => <FooterOrders key={uuidv4()} data={data} />,
  },
  sales: {
    render: (vc, datesFilter) => (
      <BodySales vc={vc} datesFilter={datesFilter} key={uuidv4()} />
    ),
    renderHeader: () => <HeaderSales key={uuidv4()} />,
    renderFooter: (data) => <FooterSales key={uuidv4()} data={data} />,
  },
  wbStocks: {
    render: (vc, datesFilter) => (
      <BodyWBStocks vc={vc} datesFilter={datesFilter} key={uuidv4()} />
    ),
    renderHeader: () => <HeaderWBStocks key={uuidv4()} />,
    renderFooter: (data) => <FooterWBStocks key={uuidv4()} data={data} />,
  },
  msStocks: {
    render: (vc, datesFilter) => <BodyMSStocks vc={vc} key={uuidv4()} />,
    renderHeader: () => <HeaderMSStocks key={uuidv4()} />,
    renderFooter: (data) => <FooterMSStocks key={uuidv4()} data={data} />,
  },
  ebitda: {
    render: (vc, datesFilter) => <BodyEbitda vc={vc} key={uuidv4()} />,
    renderHeader: () => <HeaderEbitda key={uuidv4()} />,
    renderFooter: (avg_ebitda) => (
      <FooterEbitda key={uuidv4()} avg_ebitda={avg_ebitda} />
    ),
  },
  ebitdaDaily: {
    render: (vc, datesFilter) => (
      <BodyDailyEbitda vc={vc} datesFilter={datesFilter} key={uuidv4()} />
    ),
    renderHeader: () => <HeaderDailyEbitda key={uuidv4()} />,
    renderFooter: (data) => <FooterDailyEbitda key={uuidv4()} data={data} />,
  },
  ebitdaDailyWOADS: {
    render: (vc, datesFilter) => (
      <BodyDailyEbitdaWOAds vc={vc} datesFilter={datesFilter} key={uuidv4()} />
    ),
    renderHeader: () => <HeaderDailyEbitdaWOAds key={uuidv4()} />,
    renderFooter: (data) => (
      <FooterDailyEbitdaWOAds key={uuidv4()} data={data} />
    ),
  },
  adsCosts: {
    render: (vc, datesFilter) => (
      <BodyADSCosts vc={vc} datesFilter={datesFilter} key={uuidv4()} />
    ),
    renderHeader: () => <HeaderADSCosts key={uuidv4()} />,
    renderFooter: (data) => <FooterADSCosts key={uuidv4()} data={data} />,
  },
  cpo: {
    render: (vc, datesFilter) => (
      <BodyCPO vc={vc} datesFilter={datesFilter} key={uuidv4()} />
    ),
    renderHeader: () => <HeaderCPO key={uuidv4()} />,
    renderFooter: (avgCostPerOrder) => (
      <FooterCPO key={uuidv4()} avgCostPerOrder={avgCostPerOrder} />
    ),
  },
  cps: {
    render: (vc, datesFilter) => <BodyCPS vc={vc} key={uuidv4()} />,
    renderHeader: () => <HeaderCPS key={uuidv4()} />,
    renderFooter: () => <FooterCPS key={uuidv4()} />,
  },
  buyout: {
    render: (vc, datesFilter) => <BodyBuyout vc={vc} key={uuidv4()} />,
    renderHeader: () => <HeaderBuyout key={uuidv4()} />,
    renderFooter: (avg_buyout) => (
      <FooterBuyout key={uuidv4()} avg_buyout={avg_buyout} />
    ),
  },
  priceBSPP: {
    render: (vc, datesFilter) => (
      <BodyPriceBSPP vc={vc} datesFilter={datesFilter} key={uuidv4()} />
    ),
    renderHeader: () => <HeaderPriceBSPP key={uuidv4()} />,
    renderFooter: (avg_price_b_spp) => (
      <FooterPriceBSPP key={uuidv4()} avg_price_b_spp={avg_price_b_spp} />
    ),
  },
  priceASPP: {
    render: (vc, datesFilter) => <BodyPriceASPP vc={vc} key={uuidv4()} />,
    renderHeader: () => <HeaderPriceASPP key={uuidv4()} />,
    renderFooter: (avg_price_ssp) => (
      <FooterPriceASPP key={uuidv4()} avg_price_ssp={avg_price_ssp} />
    ),
  },
  selfPrice: {
    render: (vc, datesFilter) => <BodySelfPrice vc={vc} key={uuidv4()} />,
    renderHeader: () => <HeaderSelfPrice key={uuidv4()} />,
    renderFooter: (avg_self_price) => (
      <FooterSelfPrice key={uuidv4()} avg_self_price={avg_self_price} />
    ),
  },
  selfPriceWONDS: {
    render: (vc, datesFilter) => <BodySelfPriceWONDS vc={vc} key={uuidv4()} />,
    renderHeader: () => <HeaderSelfPriceWONDS key={uuidv4()} />,
    renderFooter: () => <FooterSelfPriceWONDS key={uuidv4()} />,
  },
  turnover: {
    render: (vc, datesFilter) => <BodyTurnover vc={vc} key={uuidv4()} />,
    renderHeader: () => <HeaderTurnover key={uuidv4()} />,
    renderFooter: () => <FooterTurnover key={uuidv4()} />,
  },
};

const VendorCodesTable = ({ data, columns }) => {
  const vcNameFilter = useSelector(selectVCNameFilter);
  const datesFilter = useSelector(selectVCDatesFilter);
  const availableTags = useSelector(selectAvailableTags);
  const tableRef = useRef(null);

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

  const footerVars = {
    orders: data,
    sales: data,
    wbStocks: data,
    msStocks: data,
    ebitda: avg_ebitda,
    ebitdaDaily: data,
    ebitdaDailyWOADS: data,
    adsCosts: data,
    cpo: avgCostPerOrder,
    buyout: avg_buyout,
    priceBSPP: avg_price_b_spp,
    priceASPP: avg_price_ssp,
    selfPrice: avg_self_price,
  };

  return (
    <div className={styles.tableWrapper} ref={tableRef}>
      <div className={styles.table}>
        <div className={styles.colForHiding}></div>
        <div className={`${styles.row} ${styles.tableHeader}`}>
          <div className={`${styles.cell} ${styles.fixedColumn}`} />
          <div className={styles.cell}>Артикул</div>
          {columns.map((col) => {
            if (!col.hidden) {
              return сolRender[col.key].renderHeader();
            }
          })}
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
              {columns.map((col) => {
                if (!col.hidden) {
                  if (col.key !== 'tags') {
                    return сolRender[col.key].render(vc, datesFilter);
                  } else {
                    return сolRender[col.key].render(
                      vc,
                      availableTags,
                      tableRef
                    );
                  }
                }
              })}
            </div>
          );
        })}
        <div className={`${styles.row} ${styles.tableFooter}`}>
          <div className={`${styles.cell} ${styles.fixedColumn}`} />
          <div className={styles.cell}></div>
          {columns.map((col) => {
            if (!col.hidden && footerVars[col.key]) {
              return сolRender[col.key].renderFooter(footerVars[col.key]);
            } else if (!col.hidden && !footerVars[col.key]) {
              return сolRender[col.key].renderFooter();
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default VendorCodesTable;
