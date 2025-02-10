const createVendorCodeMetrics = (vendorCodeMetrics) => {
  const vcMetrics = vendorCodeMetrics.map((item) => {
    return {
      id: item.id,
      image: item.image.includes('basket') ? item.image : null,
      vendorCode: item.vendor_code,
      sku: item.sku,
      brand: item.brand,
      lastPriceASpp: item.last_price_after_spp,
      priceBeforeDisc: item.price_before_disc.split(',').map(Number),
      sales: item.sales.split(',').map(Number),
      buyoutP: item.avg_buyout_perc,
      ebitda: Number(item.ebitda),
      dailyEbitda: item.daily_ebitda.split(',').map(Number),
      categoryId: item.category_id,
      wbOrdersTotal: item.orders.split(',').map(Number),
      wbStocksTotal: item.wb_stocks_daily.split(',').map(Number),
      msTotal: item.ms_stocks_last,
      turnoverWB: item.turnover_wb,
      rawSales:
        item.raw_sales === '' ? [] : item.raw_sales.split(',').map(Number),
      rawDailyEbitda:
        item.raw_daily_ebitda === ''
          ? []
          : item.raw_daily_ebitda.split(',').map(Number),
      abcCurrent: item.abc_current,
      tags: item.tags,
      selfPrice: item.self_price,
      categoryName: item.category_name,
      adsCosts: item.ads_costs.split(',').map(Number),
    };
  });
  return vcMetrics;
};

export default createVendorCodeMetrics;
