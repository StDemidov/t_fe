import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { selectNotificationMessage } from '../../../redux/slices/notificationSlice';

import {
  editTaskDrain,
  selectSkuDataDrain,
  selectIsLoading,
  fetchTaskDrainById,
  fetchSkuData,
  selectTaskSingle,
} from '../../../redux/slices/tasksDrainSlice';

import {
  selectSkuOrNameTasksFilter,
  selectSkusOnDrainTagsOthersFilter,
  selectSkusOnDrainTagsClothFilter,
  selectSkusOnDrainTagsFilter,
} from '../../../redux/slices/filterSlice';

import TaskMainTagFilter from '../task_filters/TaskMainTagFilter';
import TaskClothTagFilter from '../task_filters/TaskClothTagFilter';
import TaskOthersTagFilter from '../task_filters/TaskOthersTagFilter';

import { hostName } from '../../../utils/host';

import SkuNameFilter from '../../price-cotrol-page/sku-name-filter/SkuNameFilter';

import { setError } from '../../../redux/slices/errorSlice';
import styles from './style.module.css';

const TaskEditDrain = () => {
  const dispatch = useDispatch();
  const notificationMessage = useSelector(selectNotificationMessage);
  const taskData = useSelector(selectTaskSingle);
  const skuData = useSelector(selectSkuDataDrain);
  const isLoading = useSelector(selectIsLoading);
  const skuOrNameFilter = useSelector(selectSkuOrNameTasksFilter);
  const tagsFilter = useSelector(selectSkusOnDrainTagsFilter);
  const tagsClothFilter = useSelector(selectSkusOnDrainTagsClothFilter);
  const tagsOthersFilter = useSelector(selectSkusOnDrainTagsOthersFilter);
  const navigation = useNavigate();
  let { id } = useParams();

  const [taskName, setTaskName] = useState('');
  const [increaseStep, setIncreaseStep] = useState(0);
  const [decreaseStep, setDecreaseStep] = useState(0);
  const [minPrice, setMinPrice] = useState();
  const [maxPrice, setMaxPrice] = useState();
  const [skuList, setSkuList] = useState('');
  const [byBuyout, setByBuyout] = useState(true);

  useEffect(() => {
    if (notificationMessage !== '') {
      navigation(`/tools/tasks_drain`);
    }
  }, [notificationMessage]);

  useEffect(() => {
    dispatch(fetchTaskDrainById(`${hostName}/tasksdrain/${id}`));
    dispatch(fetchSkuData(`${hostName}/skusondrain/`));
  }, []);

  useEffect(() => {
    if (taskData.task) {
      setTaskName(taskData?.task?.task_name);
      setIncreaseStep(taskData?.task?.increase_step);
      setDecreaseStep(taskData?.task?.decrease_step);
      setMinPrice(taskData?.task?.min_price);
      setMaxPrice(taskData?.task?.max_price);
      setSkuList(taskData?.task?.sku_list.split(','));
      setByBuyout(taskData?.task?.by_buyout);
    }
  }, [taskData]);

  const filteredSkuData = skuData.filter((sku) => {
    return (
      (!sku.taskId || sku.taskId == id) &&
      sku.categoryId == taskData?.category_id
    );
  });

  let tagsMain = [...new Set(filteredSkuData.flatMap((item) => item.tagsMain))];

  let tagsCloth = [
    ...new Set(filteredSkuData.flatMap((item) => item.tagsCloth)),
  ];

  let tagsOthers = [
    ...new Set(filteredSkuData.flatMap((item) => item.tagsOthers)),
  ];

  const includesAny = (arr, values) => values.some((v) => arr.includes(v));

  const filteredSkuDataWCat = filteredSkuData.filter((sku) => {
    let skuOrNameMatch = true;
    let tagsFilterMatch = true;
    let tagsClothFilterMatch = true;
    let tagsOthersFilterMatch = true;
    if (skuOrNameFilter.length !== 0) {
      if (isNaN(skuOrNameFilter)) {
        skuOrNameMatch = sku.vcName
          .toLowerCase()
          .includes(skuOrNameFilter.toLowerCase());
      } else {
        skuOrNameMatch = sku.sku.toLowerCase().includes(skuOrNameFilter);
      }
    }
    if (tagsFilter.length != 0) {
      tagsFilterMatch = includesAny(tagsFilter, sku.tagsMain);
    }
    if (tagsClothFilter.length !== 0) {
      tagsClothFilterMatch = includesAny(tagsClothFilter, sku.tagsCloth);
    }
    if (tagsOthersFilter.length !== 0) {
      tagsOthersFilterMatch = includesAny(tagsOthersFilter, sku.tagsOthers);
    }
    return (
      skuOrNameMatch &&
      tagsFilterMatch &&
      tagsClothFilterMatch &&
      tagsOthersFilterMatch
    );
  });

  const highlightMatch = (text, filter) => {
    if (filter.length === 0 || !isNaN(filter)) return text;
    const regex = new RegExp(`(${filter})`, 'gi');
    return text.split(regex).map((substring, i) => {
      if (substring.toLowerCase() === filter.toLowerCase()) {
        return (
          <span key={i} className={styles.highlight}>
            {substring}
          </span>
        );
      }
      return substring;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskName === '') {
      dispatch(setError('Название должно быть заполнено!'));
    } else if (increaseStep < 1 || decreaseStep < 1) {
      dispatch(setError('Заполните шаги изменения цены!'));
    } else if (minPrice < 1) {
      dispatch(setError('Напишите минимальную цену!'));
    } else if (maxPrice < minPrice) {
      dispatch(setError('Максимальная цена должна быть выше минимальной!'));
    } else if (skuList.length === 0) {
      dispatch(setError('Необходимо выбрать хотя бы 1 артикул!'));
    } else {
      let data = {
        task_name: taskName,
        increase_step: increaseStep,
        decrease_step: decreaseStep,
        max_price: maxPrice,
        min_price: minPrice,
        sku_list: skuList.join(','),
        by_buyout: byBuyout,
      };
      if (taskData.task.task_name == taskName) {
        data = {
          increase_step: increaseStep,
          decrease_step: decreaseStep,
          min_price: minPrice,
          max_price: maxPrice,
          sku_list: skuList.join(','),
          by_buyout: byBuyout,
        };
      }

      if (taskData.task.is_active) {
        dispatch(
          editTaskDrain({
            data: data,
            url: `${hostName}/tasksdrain/with_reset_skus/${id}`,
          })
        );
      } else {
        dispatch(
          editTaskDrain({
            data: data,
            url: `${hostName}/tasksdrain/${id}`,
          })
        );
      }
    }
  };

  const handeClickOnVC = (e) => {
    const sku = e.currentTarget.getAttribute('data-value');
    if (skuList.includes(sku)) {
      const newList = skuList.filter((elem) => {
        return elem !== sku;
      });
      setSkuList(newList);
    } else {
      setSkuList([].concat(skuList, sku));
    }
  };

  const handeClickOnAllCancel = () => {
    setSkuList([]);
  };

  const handeClickOnAllMark = () => {
    const newListSku = filteredSkuDataWCat.map((sku) => sku.sku);
    setSkuList([...skuList, ...newListSku]);
  };

  return (
    <section>
      <h1>Редактирование {taskData?.task?.task_name}</h1>
      <div className={styles.mainContainer}>
        <div className={styles.formContainer}>
          <form id="taskCreate" onSubmit={handleSubmit}>
            <ul>
              <li className={styles.nameInput}>
                <div>Название задачи</div>
                <input
                  required="true"
                  type="text"
                  id="taskName"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                />
              </li>
              <div className={styles.settingsContainer}>
                <div className={styles.pricesContainer}>
                  <div className={styles.infoText}>
                    Установите шаги изменения цен
                  </div>
                  <li>
                    <label htmlFor="increaseStep">Шаг повышения: </label>
                    <input
                      required="true"
                      type="number"
                      min="1"
                      id="increaseStep"
                      value={increaseStep === 0 ? '' : increaseStep}
                      onChange={(e) => setIncreaseStep(Number(e.target.value))}
                    />
                  </li>
                  <li>
                    <label htmlFor="decreaseStep">Шаг снижения: </label>
                    <input
                      required="true"
                      type="number"
                      min="1"
                      id="decreaseStep"
                      value={decreaseStep === 0 ? '' : decreaseStep}
                      onChange={(e) => setDecreaseStep(Number(e.target.value))}
                    />
                  </li>
                  <div className={styles.infoText}>Установите порог цен</div>
                  <li>
                    <label htmlFor="minPrice">Нижний порог цены: </label>
                    <input
                      required="true"
                      type="number"
                      min="1"
                      id="minPrice"
                      value={minPrice === 0 ? '' : minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                    />
                  </li>
                  <li>
                    <label htmlFor="maxPrice">Верхний порог цены: </label>
                    <input
                      required="true"
                      type="number"
                      min="1"
                      id="maxPrice"
                      value={maxPrice === 0 ? '' : maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                    />
                  </li>
                </div>
              </div>
              <div className={styles.infoText}>Тип оборачиваемости</div>
              <li>
                <label htmlFor="byBuyout">
                  Использовать продажи (иначе - заказы):{' '}
                </label>
                <input
                  type="checkbox"
                  id="byBuyot"
                  checked={byBuyout}
                  onChange={(e) => setByBuyout(!byBuyout)}
                />
              </li>
            </ul>

            <div className={styles.infoText}>Выберите артикулы</div>
            <div className={styles.textFilter}>
              <SkuNameFilter />
            </div>
            <div>
              <div className={styles.tagsFilters}>
                {tagsMain.length ? (
                  <TaskMainTagFilter options={tagsMain} />
                ) : (
                  <></>
                )}
                {tagsCloth.length ? (
                  <TaskClothTagFilter options={tagsCloth} />
                ) : (
                  <></>
                )}
                {tagsCloth.length ? (
                  <TaskOthersTagFilter options={tagsOthers} />
                ) : (
                  <></>
                )}
                <div
                  className={styles.buttonMark}
                  onClick={handeClickOnAllMark}
                >
                  Выбрать все
                </div>
                <div
                  className={styles.buttonMark}
                  onClick={handeClickOnAllCancel}
                >
                  Отменить выбор
                </div>
              </div>
            </div>
            <div className={styles.skuGrid}>
              {isLoading ? (
                <FaSpinner className="spinner" />
              ) : (
                filteredSkuDataWCat.map((sku) => {
                  return (
                    <div
                      className={
                        skuList.includes(sku.sku)
                          ? styles.singleSkuChosen
                          : styles.singleSku
                      }
                      onClick={handeClickOnVC}
                      data-value={sku.sku}
                    >
                      <img src={sku.image} />
                      <div>{highlightMatch(sku.vcName, skuOrNameFilter)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </form>
        </div>
        <div className={styles.infoContainer}>
          <button
            type="submit"
            form="taskCreate"
            className={styles.buttonAccept}
          >
            Применить изменения
          </button>
          <div className={styles.description}>
            <p>
              1. Название задачи должно быть уникальным, лучше всего
              придерживаться шаблона:
              <br />
              ДатаДропа_Категория_Пометка_ДатаЗаведенияЗадачи
              <br />
              (Пример: 01.01_Футболки_Узбекистан_02.01)
              <br />
              2. Алгоритм будет стараться попасть в дедлайн с ошибкой в 14 дней
              <br />
              3. Перед заведением задачи посмотрите работу алгоритма.
              <br />
              4. После заведения задачи, она автоматически становится
              неактивной, чтобы запустить ее, нажмите кнопку "Запустить" в меню
              задач.
              <br />
              5. Каждый артикул можно добавить только в одну задачу данного
              типа, если артикула нет в списке, возможно, он уже привязан к
              другой задаче
              <br />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TaskEditDrain;
