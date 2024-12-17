const createSkuDataForTasks = (skuData) => {
  const skus = skuData.map((curr) => {
    return {
      sku: curr.sku,
      vcId: curr.vendor_code_id,
      onControl: curr.onControl,
      taskId: curr.task_id,
      dateOfAppearance: new Date(curr.date_of_appearance),
      image: curr.image,
      vcName: curr.vc_name,
      categoryId: curr.category_id,
    };
  });
  return skus;
};

export default createSkuDataForTasks;
