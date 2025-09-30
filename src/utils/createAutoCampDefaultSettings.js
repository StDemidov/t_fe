const createAutoCampDefaultSettings = (settings) => {
  return {
    budget: settings.budget,
    cpm: settings.cpm,
    ctrBench: settings.ctr_bench * 100,
    viewsBench: settings.views_bench,
    whenToPause: settings.when_to_pause,
    whenToAddBudget: settings.when_to_add_budget,
    howMuchToAdd: settings.how_much_to_add,
    byBc: settings.by_bc,
    daysForTurnover: settings.days_for_turnover,
  };
};

export default createAutoCampDefaultSettings;
