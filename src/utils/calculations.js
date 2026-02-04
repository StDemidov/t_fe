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
  return ebitdaDaily.map((ebitda, index) => {
    return Math.round(ebitda - adsCosts[index] * 0.8333);
  });
};

export const calculateEbitdaWoAdsRaw = (
  ebitdaDaily,
  ebitdaDailyRaw,
  adsCosts
) => {
  if (ebitdaDailyRaw.length) {
    const adsCostRawArr = adsCosts.slice(ebitdaDaily.length);
    return ebitdaDailyRaw.map((ebitda, index) => {
      return Math.round(ebitda - adsCostRawArr[index] * 0.8333);
    });
  } else return [];
};

export const calculateArraySum = (data) => {
  return data.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
};
