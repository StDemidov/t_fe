const createSkuDataForTasksDrain = (skuData) => {
  const skus = skuData.map((curr) => {
    return {
      id: curr.id,
      sku: curr.sku,
      vcId: curr.vendor_code_id,
      vcName: curr.vc_name,
      brand: curr.brand,
      categoryId: curr.category_id,
      isOnDrain: curr.is_on_drain,
      taskId: curr.task_id,
      lastChange: new Date(curr.last_change),
      changesHistory: curr.changes_history.split(',').map(Number),
      image: curr.image,
    };
  });
  return skus;
};

export default createSkuDataForTasksDrain;
