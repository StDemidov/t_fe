import { calculateEbitdaWoAds, calculateEbitdaWoAdsRaw } from './calculations';

const createVendorCodeMetrics = (vendorCodeMetrics) => {
  const vcMetrics = vendorCodeMetrics.map((item) => {
    return {
      id: item.id,
      image: item.image.includes('basket') ? item.image : null,
      vendorCode: item.vendor_code,
      sku: item.sku,
      brand: item.brand,
      lastPriceASpp: item.last_price_after_spp,
      priceBeforeDisc: item.price_before_disc,
      sales: item.sales,
      buyoutP: item.avg_buyout_perc,
      ebitda: Number(item.ebitda),
      dailyEbitda: item.daily_ebitda,
      categoryId: item.category_id,
      wbOrdersTotal: item.orders,
      wbStocksTotal: item.wb_stocks_daily,
      msTotal: item.ms_stocks_last,
      barcodesOrdersSum: item.barcodes_orders_sum,
      turnoverWB: item.turnover_wb,
      turnoverWBBuyout:
        item.avg_buyout_perc > 0
          ? ((item.turnover_wb / item.avg_buyout_perc) * 100).toFixed(0)
          : 0,
      rawSales: item.raw_sales,
      rawDailyEbitda: item.raw_daily_ebitda,
      abcCurrent: item.abc_current,
      abcCtgryCurrent: item.abc_ctgry_current,
      tagsMain: item.tagsMain,
      tagsCloth: item.tagsCloth,
      tagsOthers: item.tagsOthers,
      selfPrice: item.self_price,
      selfPriceWONds: item.self_price_wo_nds,
      categoryName: item.category_name,
      adsCosts: item.ads_costs,
      dailyEbitdaWoAds: calculateEbitdaWoAds(item.daily_ebitda, item.ads_costs),
      dailyEbitdaWoAdsRaw: calculateEbitdaWoAdsRaw(
        item.daily_ebitda,
        item.raw_daily_ebitda,
        item.ads_costs
      ),
      addToCart: item.add_to_cart_perc.map((cr) => Number(cr) * 100),
      cartToOrder: item.cart_to_order_perc.map((cr) => Number(cr) * 100),
      clickToOrder: item.click_to_order.map((cr) => Number(cr) * 100),
      advCampaigns: item.adv_campaigns,
      sppAmount: item.spp_amount,
      deadline: item.deadline,
      lastStockRefill: item.last_stock_refill,
      cps: item.cps,
      roi: item.roi,
      abcFull: item.abc_full,
      abcCtgryFull: item.abc_ctgry_full,
    };
  });
  return vcMetrics;
};

export default createVendorCodeMetrics;
