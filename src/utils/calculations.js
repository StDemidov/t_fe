export const calculateCostPerOrder = (orders, adsCosts) => {
  return orders.map((order, index) => {
    return order === 0 ? adsCosts[index] : Math.round(adsCosts[index] / order);
  });
};

export const calculateEbitdaWoAdsForCategories = (ebitdaDaily, adsCosts) => {
  const ebitdaDailyArr = ebitdaDaily.split(',').map(Number).slice(-30);
  const adsCostsArr = adsCosts.split(',').map(Number).slice(-30);
  return ebitdaDailyArr.map((ebitda, index) => {
    return Math.round(ebitda - adsCostsArr[index] * 0.8333);
  });
};

export const calculateEbitdaWoAds = (ebitdaDaily, adsCosts) => {
  const ebitdaDailyArr = ebitdaDaily.split(',').map(Number);
  const adsCostsArr = adsCosts.split(',').map(Number);
  return ebitdaDailyArr.map((ebitda, index) => {
    return Math.round(ebitda - adsCostsArr[index] * 0.8333);
  });
};

export const calculateEbitdaWoAdsRaw = (
  ebitdaDaily,
  ebitdaDailyRaw,
  adsCosts
) => {
  const ebitdaDailyArr = ebitdaDaily.split(',').map(Number);
  const ebitdaDailyRawArr =
    ebitdaDailyRaw === '' ? [] : ebitdaDailyRaw.split(',').map(Number);
  const adsCostsArr = adsCosts.split(',').map(Number);
  if (ebitdaDailyRawArr.length) {
    const adsCostRawArr = adsCostsArr.slice(ebitdaDailyArr.length);
    return ebitdaDailyRawArr.map((ebitda, index) => {
      return Math.round(ebitda - adsCostRawArr[index] * 0.8333);
    });
  } else return [];
};
