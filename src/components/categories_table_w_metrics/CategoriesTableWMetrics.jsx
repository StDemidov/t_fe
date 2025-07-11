import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import styles from './style.module.css';
import BodyDailyOrders from './cells/body/BodyDailyOrders';
import HeaderDailyOrders from './cells/header/HeaderDailyOrders';
import BodyDailySales from './cells/body/BodyDailySales';
import HeaderDailySales from './cells/header/HeaderDailySales';
import BodyDailyEbitda from './cells/body/BodyDailyEbitda';
import HeaderDailyEbitda from './cells/header/HeaderDailyEbitda';
import BodyEbitdaAVG from './cells/body/BodyEbitdaAVG';
import HeaderEbitdaAVG from './cells/header/HeaderEbitdaAVG';
import HeaderDailyAdsCosts from './cells/header/HeaderDailyAdsCosts';
import BodyDailyAdsCosts from './cells/body/BodyDailyAdsCosts';
import HeaderDailyEbitdaWoAds from './cells/header/HeaderDailyEbitdaWoAds';
import BodyDailyEbitdaWoAds from './cells/body/BodyDailyEbitdaWoAds';
import BodyCPOClear from './cells/body/BodyCPOClear';
import BodyCPSClear from './cells/body/BodyCPSClear';
import HeaderCPSClear from './cells/header/HeaderCPSClear';
import HeaderCPOClear from './cells/header/HeaderCPOClear';
import BodyDailyPricesAvgBeforeSpp from './cells/body/BodyDailyPricesAvgBeforeSpp';
import HeaderDailyPricesAvgBeforeSpp from './cells/header/HeaderDailyPricesAvgBeforeSpp';
import BodyCrClickToCartAVG from './cells/body/BodyCrClickToCartAVG';
import BodyCrCartToOrderAVG from './cells/body/BodyCrCartToOrderAVG';
import BodyCrClickToOrderAVG from './cells/body/BodyCrClickToOrderAVG';
import HeaderCrClickToCartAVG from './cells/header/HeaderCrClickToCartAVG';
import HeaderCrClickToOrder from './cells/header/HeaderCrClickToOrder';
import HeaderCrCartToOrderAVG from './cells/header/HeaderCrCartToOrderAVG';
import HeaderBuyoutPercAVG from './cells/header/HeaderBuyoutPercAVG';
import BodyBuyoutPercAVG from './cells/body/BodyBuyoutPercAVG';
import BodyAVGSelfprice from './cells/body/BodyAVGSelfprice';
import HeaderAVGSelfprice from './cells/header/HeaderAVGSelfprice';
import HeaderItemsCount from './cells/header/HeaderItemsCount';
import BodyCPODirty from './cells/body/BodyCPODirty';
import HeaderCPODirty from './cells/header/HeaderCPODirty';
import BodyCPSDirty from './cells/body/BodyCPSDirty';
import HeaderCPSDirty from './cells/header/HeaderCPSDirty';

const CategoriesTableWMetrics = ({ categories, columns }) => {
  const navigation = useNavigate();

  const сolRender = {
    dailyOrders: {
      render: (ctgry) => <BodyDailyOrders orders={ctgry.dailyOrders} />,
      renderHeader: () => <HeaderDailyOrders key={uuidv4()} />,
    },
    dailySales: {
      render: (ctgry) => <BodyDailySales sales={ctgry.dailySales} />,
      renderHeader: () => <HeaderDailySales key={uuidv4()} />,
    },
    dailyEbitda: {
      render: (ctgry) => <BodyDailyEbitda dailyEbitda={ctgry.dailyEbitda} />,
      renderHeader: () => <HeaderDailyEbitda key={uuidv4()} />,
    },
    ebitdaAVG: {
      render: (ctgry) => <BodyEbitdaAVG ebitdaAVG={ctgry.ebitdaAVG} />,
      renderHeader: () => <HeaderEbitdaAVG key={uuidv4()} />,
    },
    dailyAdsCosts: {
      render: (ctgry) => (
        <BodyDailyAdsCosts dailyAdsCosts={ctgry.dailyAdsCosts} />
      ),
      renderHeader: () => <HeaderDailyAdsCosts key={uuidv4()} />,
    },
    dailyEbitdaWOAds: {
      render: (ctgry) => (
        <BodyDailyEbitdaWoAds dailyEbitdaWoAds={ctgry.dailyEbitdaWoAds} />
      ),
      renderHeader: () => <HeaderDailyEbitdaWoAds key={uuidv4()} />,
    },
    cpoClear: {
      render: (ctgry) => <BodyCPOClear cpoClear={ctgry.cpoClear} />,
      renderHeader: () => <HeaderCPOClear key={uuidv4()} />,
    },
    cpsClear: {
      render: (ctgry) => <BodyCPSClear cpsClear={ctgry.cpsClear} />,
      renderHeader: () => <HeaderCPSClear key={uuidv4()} />,
    },
    dailyPricesAvgBeforeSpp: {
      render: (ctgry) => (
        <BodyDailyPricesAvgBeforeSpp
          dailyPricesAvgBeforeSpp={ctgry.dailyPricesAvgBeforeSpp}
        />
      ),
      renderHeader: () => <HeaderDailyPricesAvgBeforeSpp key={uuidv4()} />,
    },
    crClickToCartAVG: {
      render: (ctgry) => (
        <BodyCrClickToCartAVG
          crClickToCartAVG={ctgry.crClickToCartAVG}
          total={ctgry.totalCrClickToCartAVG}
        />
      ),
      renderHeader: () => <HeaderCrClickToCartAVG key={uuidv4()} />,
    },
    crCartToOrderAVG: {
      render: (ctgry) => (
        <BodyCrCartToOrderAVG
          crCartToOrderAVG={ctgry.crCartToOrderAVG}
          total={ctgry.totalCrCartToOrderAVG}
        />
      ),
      renderHeader: () => <HeaderCrCartToOrderAVG key={uuidv4()} />,
    },
    crClickToOrderAVG: {
      render: (ctgry) => (
        <BodyCrClickToOrderAVG
          crClickToOrderAVG={ctgry.crClickToOrderAVG}
          total={ctgry.totalCrClickToOrderAVG}
        />
      ),
      renderHeader: () => <HeaderCrClickToOrder key={uuidv4()} />,
    },
    buyoutPercAVG: {
      render: (ctgry) => (
        <BodyBuyoutPercAVG
          buyoutPercAVG={ctgry.buyoutPercAVG}
          benchmark={ctgry.benchmark}
        />
      ),
      renderHeader: () => <HeaderBuyoutPercAVG key={uuidv4()} />,
    },
    avgSelfprice: {
      render: (ctgry) => (
        <BodyAVGSelfprice
          selfpriceWNdsAVG={ctgry.selfpriceWNdsAVG}
          selfpriceWoNdsAVG={ctgry.selfpriceWoNdsAVG}
        />
      ),
      renderHeader: () => <HeaderAVGSelfprice key={uuidv4()} />,
    },
    cpoDirty: {
      render: (ctgry) => <BodyCPODirty cpoDirty={ctgry.cpoDirty} />,
      renderHeader: () => <HeaderCPODirty key={uuidv4()} />,
    },
    cpsDirty: {
      render: (ctgry) => <BodyCPSDirty cpsDirty={ctgry.cpsDirty} />,
      renderHeader: () => <HeaderCPSDirty key={uuidv4()} />,
    },
  };

  return (
    <div>
      <div className={styles.tableBody}>
        <div className={`${styles.header}`}>
          <div
            key={uuidv4()}
            className={`${styles.fixedCell} ${styles.headerCell} `}
          >
            Категория
          </div>
          <HeaderItemsCount />
          {columns.map((col) => {
            if (!col.hidden) {
              return сolRender[col.key].renderHeader();
            }
          })}
        </div>
        {categories.map((ctgry) => {
          return (
            <div key={ctgry.categoryId} className={styles.bodyRow}>
              <div
                key={uuidv4()}
                className={` ${styles.fixedCell} ${styles.bodyCell}`}
              >
                {ctgry.categoryName}
              </div>
              <div key={uuidv4()} className={`${styles.bodyCell}`}>
                {ctgry.activeItemCount}
              </div>
              {columns.map((col) => {
                if (!col.hidden) {
                  return сolRender[col.key].render(ctgry);
                }
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesTableWMetrics;
