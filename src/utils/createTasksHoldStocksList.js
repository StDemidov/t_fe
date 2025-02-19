const createTasksHoldStocksList = (tasksHold) => {
  const taskHold = tasksHold.map((task) => {
    return {
      id: task.id,
      taskName: task.task_name,
      increaseStep: task.increase_step,
      deadline: new Date(task.deadline),
      skuList: task.sku_list.split(','),
      isActive: task.is_active,
      isCompleted: task.completed,
    };
  });
  return taskHold;
};

export default createTasksHoldStocksList;
