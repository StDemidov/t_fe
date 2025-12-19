const createCampaignsList = (campaigns) => {
  const campaignList = campaigns.map((camp) => {
    return {
      skuName: camp.sku_name,
      sku: camp.sku,
      campId: camp.camp_id,
      bidType: camp.bid_type,
      creationDate: camp.creation_date,
      status: camp.status,
      searchPlacement: camp.search_placement,
      recPlacement: camp.rec_placement,
      searchBid: camp.search_bid,
      recBid: camp.rec_bid,
      ctrBench: camp.ctr_bench,
      viewsBench: camp.views_bench,
      lowerTurnoverThreshold: camp.lower_turnover_threshold,
      turnoverDays: camp.turnover_days,
      turnoverByBarcodes: camp.turnover_by_barcodes,
      hasActiveHours: camp.has_active_hours,
      startHour: camp.start_hour,
      pauseHour: camp.pause_hour,
      pausedByUser: camp.paused_by_user,
      pausedByTurnover: camp.paused_by_turnover,
      pausedByTime: camp.paused_by_time,
      views: camp.views,
      clicks: camp.clicks,
      spend: camp.spend,
      ctr: camp.ctr,
      totalSpend: camp.total_spend,
      totalCtr: camp.total_ctr,
      photo: camp.photo,
      ctr14dTotal: camp.ctr_14d_total,
      endDate: camp.end_date,
    };
  });
  return campaignList;
};

export default createCampaignsList;
