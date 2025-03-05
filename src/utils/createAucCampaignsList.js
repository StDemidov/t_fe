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
      totalClicks,
      totalSpend,
      totalViews,
      onlineCamps,
      campaigns,
    };
  });
};
export default createAucCampaignsList;
