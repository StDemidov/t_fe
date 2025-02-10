export const calculateCostPerOrder = (orders, adsCosts) => {
  return orders.map((order, index) => {
    return order === 0 ? adsCosts[index] : Math.round(adsCosts[index] / order);
  });
};
