import { getDate } from './beaty';
import { calculateArraySum } from './calculations';

const createCampaignsList = (campaigns) => {
  console.lo;
  const campaignList = campaigns.map((camp) => {
    const sumViews = calculateArraySum(camp.views);
    const sumClicks = calculateArraySum(camp.clicks);
    const sumSpend = calculateArraySum(camp.spend);
    const currentCtr = sumViews === 0 ? 0 : sumClicks / sumViews;

    return {
      id: camp.id,
      skuName: camp.sku_name,
      sku: camp.sku,
      campId: camp.camp_id,
      bidType: camp.bid_type,
      creationDate: camp.creation_date,
      creationDateDT: getDate(camp.creation_date, true),
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
      currentCtrTotal: camp.current_ctr_total,
      dates: camp.dates,
      endDate: camp.end_date,
      category: camp.category,
      sumSpend: sumSpend,
      sumViews: sumViews,
      sumClicks: sumClicks,
      currentCtr: currentCtr,
    };
  });
  return campaignList;
};

export default createCampaignsList;
