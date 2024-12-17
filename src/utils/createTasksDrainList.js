const createTasksDrainList = (tasksDrain) => {
  const taskA28 = tasksDrain.map((task) => {
    return {
      id: task.id,
      taskName: task.task_name,
      increaseStep: task.increase_step,
      decreaseStep: task.decrease_step,
      deadline: new Date(task.deadline),
      skuList: task.sku_list.split(','),
      minPrice: task.min_price,
      isActive: task.is_active,
      isCompleted: task.completed,
    };
  });
  return taskA28;
};

export default createTasksDrainList;
