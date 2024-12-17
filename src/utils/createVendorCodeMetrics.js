const createVendorCodeMetrics = (vendorCodeMetrics) => {
  const vcMetrics = vendorCodeMetrics.map((item) => {
    let msTotal = 0;
    item.barcodes.forEach((barcode) => {
      msTotal += barcode.ms_stocks_last;
    });
    return {
      id: item.vendor_code.id,
      image: item.vendor_code.image.includes('basket')
        ? item.vendor_code.image
        : null,
      vendorCode: item.vendor_code.vendor_code,
      sku: item.vendor_code.sku,
      brand: item.vendor_code.brand,
      dateOfAppearance: item.vendor_code.date_of_appearance,
      lastPriceASpp: item.metrics.last_price_after_spp,
      priceBeforeDisc: item.metrics.price_before_disc.split(',').map(Number),
      deliveryCost: item.metrics.last_delivery_cost_per_one,
      sales: item.metrics.sales.split(',').map(Number),
      buyoutP: item.metrics.avg_buyout_perc,
      costs: item.metrics.cost,
      clothCost: item.metrics.cloth_with_nds,
      servicesCost: item.metrics.services,
      adsCosts: item.metrics.ads_costs.split(',').map(Number),
      ebitda: item.metrics.ebitda.split(',').map(Number),
      marginality: item.metrics.marginality
        .split(',')
        .map((el) => Number(el) * 100),
      dailyEbitda: item.metrics.daily_ebitda.split(',').map(Number),
      categoryId: item.category.id,
      categoryName: item.category.name,
      seasonalCoefs: item.category.seasonal_koefs.split(',').map(Number),
      priceCoefs: item.category.avg_price_koefs.split(',').map(Number),
      startDate1: item.category.enter_date_1,
      endDate1: item.category.exit_date_1,
      startDate2: item.category.enter_date_2,
      endDate2: item.category.exit_date_2,
      wbOrdersTotal: item.metrics.orders.split(',').map(Number),
      wbStocksTotal: item.metrics.wb_stocks_daily.split(',').map(Number),
      msTotal: msTotal,
      barcodes: item.barcodes,
      turnoverWB: item.metrics.turnover_wb,
      rawSales:
        item.metrics.raw_sales === ''
          ? []
          : item.metrics.raw_sales.split(',').map(Number),
      rawDailyEbitda:
        item.metrics.raw_daily_ebitda === ''
          ? []
          : item.metrics.raw_daily_ebitda.split(',').map(Number),
      abcCurrent: item.abc.current,
    };
  });
  return vcMetrics;
};

export default createVendorCodeMetrics;
