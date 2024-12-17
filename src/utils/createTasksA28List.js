const createTasksA28List = (tasksA28) => {
  const taskA28 = tasksA28.map((task) => {
    return {
      id: task.id,
      taskName: task.task_name,
      priceAAA: task.price_aaa,
      priceA: task.price_a,
      priceB: task.price_b,
      priceBC10: task.price_bc10,
      priceBC30: task.price_bc30,
      priceC: task.price_c,
      priceG: task.price_g,
      debAAA: task.deb_aaa,
      debA: task.deb_a,
      debB: task.deb_b,
      debC: task.deb_c,
      debBC10: task.deb_bc10,
      debBC30: task.deb_bc30,
      skuList: task.sku_list.split(','),
      isActive: task.is_active,
    };
  });
  return taskA28;
};

export default createTasksA28List;
