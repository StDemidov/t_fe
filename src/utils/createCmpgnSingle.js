const createCmpgnSingle = (cmpgn) => {
  return {
    id: cmpgn.id,
    campName: cmpgn.camp_name,
    campId: cmpgn.camp_id,
    brand: cmpgn.brand,
    sku: cmpgn.sku,
    status: cmpgn.status,
    createdBy: cmpgn.created_by,
    creationDate: cmpgn.creation_date,
    changeDate: cmpgn.change_date,
    currBudget: cmpgn.curr_budget,
    cpm: cmpgn.cpm,
    ctrBench: cmpgn.ctr_bench * 100,
    viewsBench: cmpgn.views_bench,
    clicks: cmpgn.clicks + cmpgn.today_clicks,
    views: cmpgn.views + cmpgn.today_views,
    spend: cmpgn.spend + cmpgn.today_spend,
    pausedByTrnover: cmpgn.paused_by_trnover,
    whenToPause: cmpgn.when_to_pause,
    whenToAddBudget: cmpgn.when_to_add_budget,
    howMuchToAdd: cmpgn.how_much_to_add,
    ctr:
      cmpgn.views + cmpgn.today_views === 0
        ? 0
        : (cmpgn.clicks + cmpgn.today_clicks) /
          (cmpgn.views + cmpgn.today_views),
    excluded: cmpgn.excluded.split(','),
    image: cmpgn.image,
    pausedInSoft: cmpgn.paused_in_soft,
  };
};

export default createCmpgnSingle;
