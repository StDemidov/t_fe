import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FaCirclePlay } from 'react-icons/fa6';
import { IoSettings } from 'react-icons/io5';
import { FaRegStopCircle } from 'react-icons/fa';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import {
  fetchTasksA28,
  fetchSkuData,
  deleteTask,
  goLiveTask,
  stopTask,
  setTaskToSkus,
  unsetTaskToSkus,
  selectTasksA28,
  selectIsLoading,
  selectSkuData,
} from '../../../../redux/slices/tasksA28Slice';
import { selectNotificationMessage } from '../../../../redux/slices/notificationSlice';
import styles from './style.module.css';
import { hostName } from '../../../../utils/host';

const TasksTableA28 = () => {
  const dispatch = useDispatch();

  const navigation = useNavigate();
  const isLoading = useSelector(selectIsLoading);
  const tasks = useSelector(selectTasksA28);
  const skuData = useSelector(selectSkuData);
  const notification = useSelector(selectNotificationMessage);

  useEffect(() => {
    dispatch(fetchTasksA28(`${hostName}/tasksa28/`));
    dispatch(fetchSkuData(`${hostName}/price_control_a_28/`));
  }, [dispatch, notification]);

  const handleClickOnTask = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    navigation(`/tools/tasks_a_28/${id}`);
  };

  const handleClickOnEdit = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    navigation(`/tools/tasks_a_28/edit/${id}`);
  };

  const handleClickOnDelete = (e) => {
    const skuStr = e.currentTarget.getAttribute('sku-list');
    const isActive = e.currentTarget.getAttribute('is-active');
    const taskName = e.currentTarget.getAttribute('task-name');
    if (isActive == 1) {
      dispatch(
        unsetTaskToSkus({
          url: `${hostName}/price_control_a_28/unset_task`,
          data: {
            sku_str: skuStr,
            task_name: taskName,
          },
        })
      );
    }
    dispatch(
      deleteTask({
        url: `${hostName}/tasksa28/delete_by_name`,
        data: {
          task_name: taskName,
        },
      })
    );
  };
  const handeClickOnButton = (e) => {
    const skuStr = e.currentTarget.getAttribute('sku-list');
    const isActive = e.currentTarget.getAttribute('is-active');
    const taskName = e.currentTarget.getAttribute('task-name');
    if (isActive == 1) {
      dispatch(
        stopTask({
          url: `${hostName}/tasksa28/change_is_active`,
          data: {
            task_name: taskName,
          },
        })
      );

      dispatch(
        unsetTaskToSkus({
          url: `${hostName}/price_control_a_28/unset_task`,
          data: {
            sku_str: skuStr,
            task_name: taskName,
          },
        })
      );
    } else {
      dispatch(
        goLiveTask({
          url: `${hostName}/tasksa28/change_is_active`,
          data: {
            task_name: taskName,
          },
        })
      );

      dispatch(
        setTaskToSkus({
          url: `${hostName}/price_control_a_28/set_task`,
          data: {
            sku_str: skuStr,
            task_name: taskName,
          },
        })
      );
    }
  };

  const navigateToCreateTask = () => {
    navigation(`/tools/tasks_a_28/create`);
  };

  const getVCInfo = (skuList) => {
    let skuInfoList = [];
    for (let i = 0; i < skuList.length; i++) {
      for (let j = 0; j < skuData.length; j++) {
        if (String(skuList[i]) === skuData[j].sku) {
          skuInfoList.push({
            name: skuData[j].vcName,
            image: skuData[j].image,
          });
        }
      }
    }
    return skuInfoList;
  };

  const sortedTasks = tasks.slice();

  sortedTasks.sort((a, b) => {
    return b.isActive - a.isActive;
  });

  return (
    <div className={styles.mainBox}>
      <div className={styles.tasksColumn}>
        {isLoading ? (
          <FaSpinner className="spinner" />
        ) : sortedTasks.length === 0 ? (
          <div className={styles.emptyList}>Здесь пока пусто</div>
        ) : (
          sortedTasks.map((task) => {
            const skuInfo = getVCInfo(task.skuList);
            return (
              <div key={uuidv4()}>
                <div>
                  <div
                    data-value={task?.id}
                    onClick={handleClickOnTask}
                    className={`${styles.taskCard} ${
                      task.isActive ? styles.taskActive : styles.taskInactive
                    }`}
                  >
                    <div className={styles.taskInfo}>
                      <div className={styles.taskHeader}>
                        <div
                          className={`${
                            task.isActive
                              ? styles.pointActive
                              : styles.pointInactive
                          }`}
                        ></div>
                        <div className={styles.taskName}>{task.taskName}</div>
                      </div>
                      <span className={styles.skusLine}>
                        Aртикулы:
                        <div className={styles.singleSku}>
                          <img src={skuInfo[0]?.image} alt="фото" />
                          <div>{skuInfo[0]?.name}</div>
                        </div>
                        {skuInfo.length > 1 ? (
                          <div className={styles.singleSku}>
                            <img src={skuInfo[1]?.image} alt="фото" />
                            <div>{skuInfo[1]?.name}</div>
                          </div>
                        ) : (
                          ''
                        )}
                        {skuInfo.length > 2
                          ? `и еще ${skuInfo.length - 2}`
                          : ''}
                      </span>
                    </div>
                    <div className={styles.taskNumbers}>
                      <div className={styles.numberText}>
                        <span className={styles.category}></span>
                        <span className={styles.price}>Цена</span>
                        <span className={styles.deb}>EBITDA</span>
                      </div>
                      <div className={styles.numberText}>
                        <span className={styles.category}>AAA</span>
                        <span className={styles.price}>{task.priceAAA}</span>
                        <span className={styles.deb}>{task.debAAA}</span>
                      </div>
                      <div className={styles.numberText}>
                        <span className={styles.category}>A</span>
                        <span className={styles.price}>{task.priceA}</span>
                        <span className={styles.deb}>{task.debA}</span>
                      </div>
                      <div className={styles.numberText}>
                        <span className={styles.category}>B</span>
                        <span className={styles.price}>{task.priceB}</span>
                        <span className={styles.deb}>{task.debB}</span>
                      </div>
                      <div className={styles.numberText}>
                        <span className={styles.category}>BC30</span>
                        <span className={styles.price}>{task.priceBC30}</span>
                        <span className={styles.deb}>{task.debBC30}</span>
                      </div>
                      <div className={styles.numberText}>
                        <span className={styles.category}>BC10</span>
                        <span className={styles.price}>{task.priceBC10}</span>
                        <span className={styles.deb}>{task.debBC10}</span>
                      </div>
                      <div className={styles.numberText}>
                        <span className={styles.category}>C</span>
                        <span className={styles.price}>{task.priceC}</span>
                        <span className={styles.deb}>{task.debC}</span>
                      </div>
                      <div className={styles.numberText}>
                        <span className={styles.category}>G</span>
                        <span className={styles.price}>{task.priceG}</span>
                        <span className={styles.deb}></span>
                      </div>
                    </div>
                    <div className={styles.taskButtons}>
                      <button
                        className={
                          task.isActive ? styles.buttonStop : styles.buttonStart
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handeClickOnButton(e);
                        }}
                        sku-list={task.skuList}
                        is-active={task.isActive ? 1 : 0}
                        task-name={task.taskName}
                      >
                        {task.isActive ? <FaRegStopCircle /> : <FaCirclePlay />}
                      </button>
                      <button
                        className={styles.buttonStop}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClickOnEdit(e);
                        }}
                        data-value={task.id}
                      >
                        <IoSettings />
                      </button>
                      <button
                        className={styles.buttonStop}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClickOnDelete(e);
                        }}
                        sku-list={task.skuList}
                        is-active={task.isActive ? 1 : 0}
                        task-name={task.taskName}
                      >
                        <RiDeleteBin2Fill />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className={styles.buttonCreate} onClick={navigateToCreateTask}>
        <div className={styles.buttonCreateContent}>
          <p className={styles.buttonCreateTitle}>Завести новую задачу</p>
          <p className={styles.buttonCreatePara}>
            Задачи на регулировку цен в зависимости от рассчитываемой
            АВС-категории до 28 дня жизни товара
          </p>
        </div>
      </div>
    </div>
  );
};

export default TasksTableA28;
