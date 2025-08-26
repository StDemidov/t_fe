const createSKUListForAbTests = (skuList) => {
  return skuList.map((curr) => {
    return {
      sku: curr.sku,
      vendorcode: curr.vendorcode,
      image: curr.image,
      isOnAb: curr.is_on_ab,
      hasAutoAd: curr.has_auto_ad,
      hasAucAd: curr.has_auc_ad,
      isOnDrain: curr.is_on_drain,
      isOnHold: curr.is_on_hold,
    };
  });
};

export default createSKUListForAbTests;
