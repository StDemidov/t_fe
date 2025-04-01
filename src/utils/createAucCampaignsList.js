const createAucCampaignsList = (response) => {
  return response.map((item) => {
    const parentID = Object.keys(item)[0];
    const campaignsData = item[parentID];

    let totalClicks = 0;
    let totalSpend = 0;
    let totalViews = 0;
    let onlineCamps = 0;

    const campaigns = Object.entries(campaignsData).map(([campId, data]) => {
      totalClicks += data.clicks + data.today_clicks;
      totalSpend += data.spend + data.today_spend;
      totalViews += data.views + data.today_views;
      onlineCamps += data.status === 9 ? 1 : 0;

      return {
        campId: Number(campId),
        ...data,
      };
    });

    return {
      parentID,
      sku: campaigns[0]?.sku || null,
      vcName: campaigns[0]?.vendor_code || null,
      skuImage: campaigns[0]?.image || null,
      status: campaigns[0]?.paused_in_soft
        ? 'Остановлено в софте'
        : campaigns[0]?.paused_by_trnover
        ? 'Пауза по оборачиваемости'
        : 'Идут показы',
      ctr:
        campaigns[0]?.views + campaigns[0]?.today_views
          ? ((campaigns[0]?.clicks + campaigns[0]?.today_clicks) /
              (campaigns[0]?.views + campaigns[0]?.today_views)) *
            100
          : 0,
      totalClicks,
      totalSpend,
      totalViews,
      onlineCamps,
      campaigns,
    };
  });
};
export default createAucCampaignsList;
