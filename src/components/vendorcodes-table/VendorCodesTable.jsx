import LazyLoad from 'react-lazyload';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { useRef } from 'react';
import { FaRegCopy } from 'react-icons/fa';

import styles from './style.module.css';

import {
  selectVCNameFilter,
  selectVCDatesFilter,
} from '../../redux/slices/filterSlice';

import {
  selectAvailableTagsMain,
  selectAvailableTagsCloth,
  selectAvailableTagsOthers,
  selectPageVendorcodes,
  setPageVendorcodes,
} from '../../redux/slices/vendorCodeSlice';

import { FaAngleLeft } from 'react-icons/fa6';
import { FaAnglesLeft } from 'react-icons/fa6';

import { FaAngleRight } from 'react-icons/fa6';
import { FaAnglesRight } from 'react-icons/fa6';

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
import HeaderTurnoverBO from './cells/header/HeaderTurnoverBO';
import HeaderAddToCart from './cells/header/HeaderAddToCart';
import HeaderCartToOrder from './cells/header/HeaderCartToOrder';
import HeaderClickToOrder from './cells/header/HeaderClickToOrder';
import HeaderTagsCloth from './cells/header/HeaderTagsCloth';
import HeaderTagsOthers from './cells/header/HeaderTagsOthers';
import HeaderCampaigns from './cells/header/HeaderCampaigns';
import HeaderDeadline from './cells/header/HeaderDeadline';

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
import BodyTurnoverBO from './cells/body/BodyTurnoverBO';
import BodyCartToOrder from './cells/body/BodyCartToOrder';
import BodyClickToOrder from './cells/body/BodyClickToOrder';
import BodyAddToCart from './cells/body/BodyAddToCart';
import BodyTags from './cells/body/BodyTags';
import BodyTagsCloth from './cells/body/BodyTagsCloth';
import BodyTagsOthers from './cells/body/BodyTagsOthers';
import BodyCampaigns from './cells/body/BodyCampaigns';
import BodyDeadline from './cells/body/BodyDeadline';

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
import FooterTurnoverBO from './cells/footer/FooterTurnoverBO';
import FooterWBStocks from './cells/footer/FooterWBStocks';
import FooterCartToOrder from './cells/footer/FooterCartToOrder';
import FooterClickToOrder from './cells/footer/FooterClickToOrder';
import FooterAddToCart from './cells/footer/FooterAddToCart';
import FooterTagsOthers from './cells/footer/FooterTagsOthers';
import FooterTagsCloth from './cells/footer/FooterTagsCloth';
import FooterCampaigns from './cells/footer/FooterCampaigns';
import FooterDeadline from './cells/footer/FooterDeadline';
import BodyROI from './cells/body/BodyROI';
import HeaderROI from './cells/header/HeaderROI';
import FooterROI from './cells/footer/FooterROI';
import HeaderBarcodesOrdersSum from './cells/header/HeaderBarcodesOrdersSum';
import BodyBarcodesOrdersSum from './cells/body/BodyBarcodesOrdersSum';
import FooterBarcodesOrdersSum from './cells/footer/FooterBarcodesOrdersSum';

const сolRender = {
  tags: {
    render: (vc, availableTagsMain, tableRef) => (
      <BodyTags
        tags={vc.tagsMain}
        availableTagsMain={availableTagsMain}
        skuId={vc.id}
        tableRef={tableRef}
        key={uuidv4()}
      />
    ),
    renderHeader: () => <HeaderTags key={uuidv4()} />,
    renderFooter: () => <FooterTags key={uuidv4()} />,
  },
  tagsCloth: {
    render: (vc, availableTagsCloth, tableRef) => (
      <BodyTagsCloth
        tags={vc.tagsCloth}
        availableTagsCloth={availableTagsCloth}
        skuId={vc.id}
        tableRef={tableRef}
        key={uuidv4()}
      />
    ),
    renderHeader: () => <HeaderTagsCloth key={uuidv4()} />,
    renderFooter: () => <FooterTagsCloth key={uuidv4()} />,
  },
  tagsOthers: {
    render: (vc, availableTagsOthers, tableRef) => (
      <BodyTagsOthers
        tags={vc.tagsOthers}
        availableTagsOthers={availableTagsOthers}
        skuId={vc.id}
        tableRef={tableRef}
        key={uuidv4()}
      />
    ),
    renderHeader: () => <HeaderTagsOthers key={uuidv4()} />,
    renderFooter: () => <FooterTagsOthers key={uuidv4()} />,
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
  barcodesOrdersSum: {
    render: (vc, datesFilter) => (
      <BodyBarcodesOrdersSum vc={vc} key={uuidv4()} />
    ),
    renderHeader: () => <HeaderBarcodesOrdersSum key={uuidv4()} />,
    renderFooter: (sumBarcodesOrders) => (
      <FooterBarcodesOrdersSum
        key={uuidv4()}
        sumBarcodesOrders={sumBarcodesOrders}
      />
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
  cartToOrder: {
    render: (vc, datesFilter) => (
      <BodyCartToOrder vc={vc} datesFilter={datesFilter} key={uuidv4()} />
    ),
    renderHeader: () => <HeaderCartToOrder key={uuidv4()} />,
    renderFooter: (avgCartToOrder) => (
      <FooterCartToOrder key={uuidv4()} avgCartToOrder={avgCartToOrder} />
    ),
  },
  clickToOrder: {
    render: (vc, datesFilter) => (
      <BodyClickToOrder vc={vc} datesFilter={datesFilter} key={uuidv4()} />
    ),
    renderHeader: () => <HeaderClickToOrder key={uuidv4()} />,
    renderFooter: (avgClickToOrder) => (
      <FooterClickToOrder key={uuidv4()} avgClickToOrder={avgClickToOrder} />
    ),
  },
  addToCart: {
    render: (vc, datesFilter) => (
      <BodyAddToCart vc={vc} datesFilter={datesFilter} key={uuidv4()} />
    ),
    renderHeader: () => <HeaderAddToCart key={uuidv4()} />,
    renderFooter: (avgAddToCart) => (
      <FooterAddToCart key={uuidv4()} avgAddToCart={avgAddToCart} />
    ),
  },
  cps: {
    render: (vc, datesFilter) => <BodyCPS vc={vc} key={uuidv4()} />,
    renderHeader: () => <HeaderCPS key={uuidv4()} />,
    renderFooter: () => <FooterCPS key={uuidv4()} />,
  },
  roi: {
    render: (vc, datesFilter) => <BodyROI vc={vc} key={uuidv4()} />,
    renderHeader: () => <HeaderROI key={uuidv4()} />,
    renderFooter: () => <FooterROI key={uuidv4()} />,
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
    renderFooter: (avg_prices) => (
      <FooterPriceBSPP
        key={uuidv4()}
        avg_price_b_spp={avg_prices[0]}
        fullAvgPrice={avg_prices[1]}
      />
    ),
  },
  // priceASPP: {
  //   render: (vc, datesFilter) => <BodyPriceASPP vc={vc} key={uuidv4()} />,
  //   renderHeader: () => <HeaderPriceASPP key={uuidv4()} />,
  //   renderFooter: (avg_price_ssp) => (
  //     <FooterPriceASPP key={uuidv4()} avg_price_ssp={avg_price_ssp} />
  //   ),
  // },
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
    renderFooter: (selfPriceWONDS) => (
      <FooterSelfPriceWONDS key={uuidv4()} selfPriceWONDS={selfPriceWONDS} />
    ),
  },
  turnover: {
    render: (vc, datesFilter) => <BodyTurnover vc={vc} key={uuidv4()} />,
    renderHeader: () => <HeaderTurnover key={uuidv4()} />,
    renderFooter: () => <FooterTurnover key={uuidv4()} />,
  },
  turnoverBO: {
    render: (vc, datesFilter) => <BodyTurnoverBO vc={vc} key={uuidv4()} />,
    renderHeader: () => <HeaderTurnoverBO key={uuidv4()} />,
    renderFooter: () => <FooterTurnoverBO key={uuidv4()} />,
  },
  campaigns: {
    render: (vc, datesFilter) => <BodyCampaigns vc={vc} key={uuidv4()} />,
    renderHeader: () => <HeaderCampaigns key={uuidv4()} />,
    renderFooter: () => <FooterCampaigns key={uuidv4()} />,
  },

  deadline: {
    render: (vc, datesFilter) => <BodyDeadline vc={vc} key={uuidv4()} />,
    renderHeader: () => <HeaderDeadline key={uuidv4()} />,
    renderFooter: () => <FooterDeadline key={uuidv4()} />,
  },
};

const VendorCodesTable = ({ data, columns, dataSplitted }) => {
  const pagesNumber = dataSplitted?.length;
  const vcNameFilter = useSelector(selectVCNameFilter);
  const datesFilter = useSelector(selectVCDatesFilter);
  const availableTagsMain = useSelector(selectAvailableTagsMain);
  const availableTagsCloth = useSelector(selectAvailableTagsCloth);
  const availableTagsOthers = useSelector(selectAvailableTagsOthers);
  const tableRef = useRef(null);
  const currentPage = useSelector(selectPageVendorcodes);
  const dispatch = useDispatch();

  const handleCopy = (event) => {
    event.stopPropagation(); // Останавливаем всплытие
    event.preventDefault(); // Предотвращаем переход по ссылке (если нужно)

    navigator.clipboard.writeText(
      event.currentTarget.getAttribute('data-value')
    );
  };

  const handleClickOnPage = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    dispatch(setPageVendorcodes(id));
  };
  const handleClickOnNextPage = (event) => {
    if (currentPage !== pagesArray.length) {
      dispatch(setPageVendorcodes(currentPage + 1));
    }
  };
  const handleClickOnPrevPage = (event) => {
    if (currentPage > 1) {
      dispatch(setPageVendorcodes(currentPage - 1));
    }
  };
  const handleClickOnFirstPage = (event) => {
    if (currentPage > 1) {
      dispatch(setPageVendorcodes(1));
    }
  };
  const handleClickOnLastPage = (event) => {
    if (currentPage !== pagesArray.length - 1) {
      dispatch(setPageVendorcodes(pagesArray.length));
    }
  };

  const pagesArray = [];
  for (let i = 1; i <= pagesNumber; i++) {
    pagesArray.push(i);
  }

  if (currentPage > pagesArray.length) {
    dispatch(setPageVendorcodes(1));
  }

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
  const avgSelfPriceWONDS = Math.round(
    data.reduce((total, next) => total + next.selfPriceWONds, 0) / data.length
  );
  const avgAddToCart = Math.round(
    data.reduce((total, next) => total + next.addToCart.at(-1), 0) / data.length
  );
  const avgCartToOrder = Math.round(
    data.reduce((total, next) => total + next.cartToOrder.at(-1), 0) /
      data.length
  );
  const avgClickToOrder = Math.round(
    data.reduce((total, next) => total + next.clickToOrder.at(-1), 0) /
      data.length
  );
  const avgPrice = Math.round(
    data.reduce((total, next) => total + next.priceAVG, 0) / data.length
  );

  const sumBarcodesOrders = data.reduce(
    (total, next) => total + next.barcodesOrdersSum,
    0
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
    barcodesOrdersSum: sumBarcodesOrders,
    cpo: avgCostPerOrder,
    buyout: avg_buyout,
    priceBSPP: [avg_price_b_spp, avgPrice],
    priceASPP: avg_price_ssp,
    selfPrice: avg_self_price,
    selfPriceWONDS: avgSelfPriceWONDS,
    addToCart: avgAddToCart,
    cartToOrder: avgCartToOrder,
    clickToOrder: avgClickToOrder,
  };

  return (
    <div className={styles.mainWrapper}>
      <div className={styles.tableWrapper} ref={tableRef}>
        <div className={styles.table}>
          <div className={styles.colForHiding}></div>
          <div className={`${styles.row} ${styles.tableHeader}`}>
            <div className={`${styles.cell} ${styles.fixedColumn}`} />
            <div className={styles.cell} style={{ color: 'black' }}>
              Артикул
            </div>
            {columns.map((col) => {
              if (!col.hidden) {
                return сolRender[col.key].renderHeader();
              }
            })}
          </div>
          {dataSplitted[currentPage - 1] ? (
            dataSplitted[currentPage - 1].map((vc) => {
              return (
                <div className={styles.row} key={vc.id}>
                  <div className={`${styles.cell} ${styles.fixedColumn}`}>
                    <div className={styles.imageBlock}>
                      <div className={styles.abc}>
                        <span>{vc.abcCtgryCurrent}</span>
                        <span>{vc.abcCurrent}</span>
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
                    <div className={styles.vendorcodeName} data-value={vc.id}>
                      <div className={styles.vendorcodeText}>
                        {vc.vendorCode}
                      </div>
                    </div>
                    <FaRegCopy
                      size={12}
                      data-value={vc.vendorCode}
                      onClick={handleCopy}
                      style={{ cursor: 'pointer' }}
                      className={styles.copyIcon}
                    />
                  </Link>
                  {columns.map((col) => {
                    if (!col.hidden) {
                      if (
                        col.key !== 'tags' &&
                        col.key !== 'tagsCloth' &&
                        col.key !== 'tagsOthers'
                      ) {
                        return сolRender[col.key].render(vc, datesFilter);
                      } else {
                        if (col.key == 'tags') {
                          return сolRender[col.key].render(
                            vc,
                            availableTagsMain,
                            tableRef
                          );
                        } else if (col.key == 'tagsCloth') {
                          return сolRender[col.key].render(
                            vc,
                            availableTagsCloth,
                            tableRef
                          );
                        } else {
                          return сolRender[col.key].render(
                            vc,
                            availableTagsOthers,
                            tableRef
                          );
                        }
                      }
                    }
                  })}
                </div>
              );
            })
          ) : (
            <></>
          )}
          <div className={`${styles.row} ${styles.tableFooter}`}>
            <div className={`${styles.cell} ${styles.fixedColumn}`} />
            <div className={styles.cell} style={{ color: 'black' }}>
              Количество: {data.length}
            </div>
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
      <div className={styles.paginatorDefault}>
        <FaAnglesLeft
          className={`${
            currentPage > 1 ? styles.pageArrow : styles.disabledArrow
          }`}
          onClick={handleClickOnFirstPage}
        />
        <FaAngleLeft
          className={`${
            currentPage > 1 ? styles.pageArrow : styles.disabledArrow
          }`}
          onClick={handleClickOnPrevPage}
        />
        <div
          className={`${styles.pageIcon} ${styles.currentPage}`}
          data-value={currentPage}
          key={'page_' + currentPage}
        >
          Страница {currentPage} из {pagesArray.length}
        </div>
        <FaAngleRight
          className={`${
            currentPage !== pagesArray.length
              ? styles.pageArrow
              : styles.disabledArrow
          }`}
          onClick={handleClickOnNextPage}
        />
        <FaAnglesRight
          className={`${
            currentPage !== pagesArray.length
              ? styles.pageArrow
              : styles.disabledArrow
          }`}
          onClick={handleClickOnLastPage}
        />
      </div>
    </div>
  );
};

export default VendorCodesTable;
