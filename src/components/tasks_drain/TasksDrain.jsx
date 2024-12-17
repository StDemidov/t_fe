import TasksTableDrain from './tasks_table_drain/TasksTableDrain';

const TasksDrain = () => {
  return (
    <section>
      <div>
        <h1>Задачи на ликвидацию товара</h1>
      </div>
      <div>
        <TasksTableDrain />
      </div>
    </section>
  );
};

export default TasksDrain;
