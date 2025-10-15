const createABtestsLists = (response) => {
  let res = {
    active: [],
    completed: [],
    failed: [],
  };

  Object.keys(response).forEach((key) => {
    const tests_list = response[key];
    const tests = tests_list.map((item) => {
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
        image: item.image,
        category: item.category,
        vcName: item.vc_name,
      };
    });
    if (key === 'active') {
      res.active = tests;
    } else if (key === 'completed') {
      res.completed = tests;
    } else {
      res.failed = tests;
    }
  });
  return res;
};

export default createABtestsLists;
