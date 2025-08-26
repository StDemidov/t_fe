const createABtestSingle = (item) => {
  return {
    testId: item.id,
    adId: item.ad_id,
    name: item.name,
    sku: item.sku,
    brand: item.brand,
    numOfPhotos: item.num_of_photos,
    estimatedBudget: item.estimated_budget,
    startDate: item.start_date,
    cpm: item.cpm,
    viewsGoal: item.views_goal,
    balanceType: item.balance_type,
    isCompleted: item.is_completed,
    isOnPause: item.is_on_pause,
    pauseReason: item.pause_reason,
    images: item.images.map((img) => {
      return {
        url: img.url,
        startPos: img.start_pos,
        views: img.views,
        clicks: img.clicks,
        isTested: img.is_tested,
        isTesting: img.is_testing,
      };
    }),
  };
};

export default createABtestSingle;
