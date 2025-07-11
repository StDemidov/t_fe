import { calculateEbitdaWoAds, calculateCostPerOrder } from './calculations';

const createCategoriesMetricsList = (categories) => {
  const categoriesMetrics = categories.map((item) => {
    const cpoDirty = calculateCostPerOrder(
      item.daily_orders.split(',').map(Number).slice(-30),
      item.daily_ads_costs.split(',').map(Number).slice(-30)
    );
    return {
      id: item.category_id,
      categoryName: item.category_name,
      activeItemCount: item.items_count,
      dailyOrders: item.daily_orders.split(',').map(Number).slice(-30),
      dailySales: (item.daily_sales + ',' + item.daily_sales_raw)
        .split(',')
        .map(Number)
        .slice(-30),
      dailyStocks: item.daily_stocks_wb.split(',').map(Number).slice(-30),
      ebitdaAVG: item.ebitda_avg.split(',').map(Number).slice(-30),
      dailyEbitda: (item.daily_ebitda + ',' + item.daily_ebitda_raw)
        .split(',')
        .map(Number)
        .slice(-30),
      dailyEbitdaWoAds: calculateEbitdaWoAds(
        item.daily_ebitda + ',' + item.daily_ebitda_raw,
        item.daily_ads_costs
      ).slice(-30),
      dailyAdsCosts: item.daily_ads_costs.split(',').map(Number).slice(-30),
      cpoClear: item.cpo.split(',').map(Number).slice(-30),
      cpoDirty: cpoDirty,
      cpsClear: item.cps.split(',').map(Number).slice(-30),
      cpsDirty: cpoDirty.map((cpo) => {
        if (!item.buyout_perc_avg) {
          return 0;
        }
        return Number(((cpo / item.buyout_perc_avg) * 100).toFixed(0));
      }),
      buyoutPercAVG: item.buyout_perc_avg,
      crClickToCartAVG: item.cr_click_to_cart_avg
        .split(',')
        .map(Number)
        .slice(-30),
      crCartToOrderAVG: item.cr_cart_to_order_avg
        .split(',')
        .map(Number)
        .slice(-30),
      crClickToOrderAVG: item.cr_click_to_order_avg
        .split(',')
        .map(Number)
        .slice(-30),
      totalCrClickToCartAVG: item.total_cr_click_to_cart / 100,
      totalCrCartToOrderAVG: item.total_cr_cart_to_order / 100,
      totalCrClickToOrderAVG: item.total_cr_click_to_order / 100,
      selfpriceWNdsAVG: item.selfprice_w_nds_avg,
      selfpriceWoNdsAVG: item.selfprice_wo_nds_avg,
      dailyPricesAvgBeforeSpp: item.daily_prices_avg_before_spp
        .split(',')
        .map(Number)
        .slice(-30),
      dailyOrderAVG: item.daily_orders_avg.split(',').map(Number),
      dailySalesAVG7d: item.daily_sales_avg_7d,
      dailyEbitdaAVG7d: item.daily_ebitda_avg_7d,
      benchmark: item.benchmark,
    };
  });
  const filteredCategoriesMetrics = categoriesMetrics.filter((item) => {
    return item.activeItemCount === 0 ? false : true;
  });
  return filteredCategoriesMetrics;
};

export default createCategoriesMetricsList;
