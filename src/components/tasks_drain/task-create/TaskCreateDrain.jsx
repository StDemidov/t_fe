import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { selectNotificationMessage } from '../../../redux/slices/notificationSlice';

import {
  createTaskDrain,
  fetchSkuData,
  selectSkuDataDrain,
  selectIsLoading,
} from '../../../redux/slices/tasksDrainSlice';

import {
  selectTasksCategory,
  resetTasksCategory,
  resetSkuOrNameTasksFilter,
  selectSkuOrNameTasksFilter,
  selectSkusOnDrainTagsOthersFilter,
  selectSkusOnDrainTagsClothFilter,
  selectSkusOnDrainTagsFilter,
} from '../../../redux/slices/filterSlice';
import {
  fetchCategories,
  selectCategories,
} from '../../../redux/slices/categorySlice';
import CategoryFilterTasks from '../../price-cotrol-page/category-filter-tasks/CategoryFilterTasks';
import SkuNameFilter from '../../price-cotrol-page/sku-name-filter/SkuNameFilter';

import { setError } from '../../../redux/slices/errorSlice';
import styles from './style.module.css';
import { hostName } from '../../../utils/host';
import TaskMainTagFilter from '../task_filters/TaskMainTagFilter';
import TaskClothTagFilter from '../task_filters/TaskClothTagFilter';
import TaskOthersTagFilter from '../task_filters/TaskOthersTagFilter';

const TaskCreateDrain = () => {
  const dispatch = useDispatch();
  const notificationMessage = useSelector(selectNotificationMessage);
  const skuData = useSelector(selectSkuDataDrain);
  const isLoading = useSelector(selectIsLoading);
  const allCategories = useSelector(selectCategories);
  const selectedCategory = useSelector(selectTasksCategory);
  const skuOrNameFilter = useSelector(selectSkuOrNameTasksFilter);
  const tagsFilter = useSelector(selectSkusOnDrainTagsFilter);
  const tagsClothFilter = useSelector(selectSkusOnDrainTagsClothFilter);
  const tagsOthersFilter = useSelector(selectSkusOnDrainTagsOthersFilter);

  const navigation = useNavigate();

  useEffect(() => {
    dispatch(fetchSkuData(`${hostName}/skusondrain/`));
    if (notificationMessage !== '') {
      navigation(`/tools/tasks_drain`);
    }
  }, [notificationMessage, navigation, skuData.length, dispatch]);

  useEffect(() => {
    if (notificationMessage !== '') {
      dispatch(resetTasksCategory());
      navigation(`/tools/tasks_drain`);
    }
  }, [notificationMessage]);

  useEffect(() => {
    dispatch(resetTasksCategory());
    dispatch(fetchCategories(`${hostName}/category/`));
    dispatch(fetchSkuData(`${hostName}/skusondrain/`));
  }, [dispatch]);

  useEffect(() => {
    setSkuList([]);
    dispatch(resetSkuOrNameTasksFilter());
  }, [selectedCategory]);

  const [taskName, setTaskName] = useState('');
  const [increaseStep, setIncreaseStep] = useState(0);
  const [decreaseStep, setDecreaseStep] = useState(0);
  const [errorDays, setErrorDays] = useState(1);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [deadline, setDeadline] = useState('ГГГГ-ММ-ДД');
  const [skuList, setSkuList] = useState([]);
  const [byBuyout, setByBuyout] = useState(true);

  const filteredSkuData = skuData.filter((sku) => {
    return !sku.is_on_drain;
  });
  const includesAny = (arr, values) => values.some((v) => arr.includes(v));

  const filteredSkuDataWCat = filteredSkuData.filter((sku) => {
    let categoryMatch = true;
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
    if (selectedCategory !== '') {
      categoryMatch = Number(sku.categoryId) === Number(selectedCategory.id);
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
      categoryMatch &&
      skuOrNameMatch &&
      tagsFilterMatch &&
      tagsClothFilterMatch &&
      tagsOthersFilterMatch
    );
  });

  let tagsMain = [...new Set(filteredSkuData.flatMap((item) => item.tagsMain))];

  let tagsCloth = [
    ...new Set(filteredSkuData.flatMap((item) => item.tagsCloth)),
  ];

  let tagsOthers = [
    ...new Set(filteredSkuData.flatMap((item) => item.tagsOthers)),
  ];

  let categories_ids = filteredSkuData.map((sku) => {
    return sku.categoryId;
  });
  let categories = allCategories.filter((cat) => {
    return categories_ids.includes(cat.id);
  });
  categories = categories.map((cat) => {
    return { id: cat.id, name: cat.name };
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
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(deadline); // проверка формата ГГГГ-ММ-ДД
    if (taskName === '') {
      dispatch(setError('Название должно быть заполнено!'));
    } else if (increaseStep < 1 || decreaseStep < 1) {
      dispatch(setError('Заполните шаги изменения цены!'));
    } else if (minPrice < 1) {
      dispatch(setError('Напишите минимальную цену!'));
    } else if (maxPrice <= minPrice) {
      dispatch(setError('Максимальная цена должна быть выше минимальной!'));
    } else if (!isValidDate) {
      dispatch(setError('Введите дату в формате ГГГГ-ММ-ДД'));
    } else if (skuList.length === 0) {
      dispatch(setError('Необходимо выбрать хотя бы 1 артикул!'));
    } else if (errorDays < 1) {
      dispatch(setError('Установите погрешность по дням!'));
    } else {
      const data = {
        task_name: taskName,
        increase_step: increaseStep,
        decrease_step: decreaseStep,
        deadline: deadline,
        min_price: minPrice,
        max_price: maxPrice,
        sku_list: skuList.join(','),
        by_buyout: byBuyout,
        error: errorDays,
      };
      dispatch(
        createTaskDrain({
          data: data,
          url: `${hostName}/tasksdrain/`,
        })
      );
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
      <h1>Новая задача для ликвидации товаров</h1>
      <div className={styles.mainContainer}>
        <div className={styles.formContainer}>
          <form id="taskCreate" onSubmit={handleSubmit}>
            <ul>
              <li className={styles.nameInput}>
                <div>Название задачи</div>
                <input
                  required={true}
                  type="text"
                  id="taskName"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                />
              </li>
              <div className={styles.categoryFilter}>
                <CategoryFilterTasks options={categories} />
              </div>
              <div className={styles.settingsContainer}>
                <div className={styles.pricesContainer}>
                  <div className={styles.infoText}>
                    Установите шаги изменения цен
                  </div>
                  <li>
                    <label htmlFor="increaseStep">Шаг повышения: </label>
                    <input
                      required={true}
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
                      required={true}
                      type="number"
                      min="1"
                      id="decreaseStep"
                      value={decreaseStep === 0 ? '' : decreaseStep}
                      onChange={(e) => setDecreaseStep(Number(e.target.value))}
                    />
                  </li>
                  <div className={styles.infoText}>Установите пороги цен</div>
                  <li>
                    <label htmlFor="minPrice">Нижний порог цены: </label>
                    <input
                      required={true}
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
                      required={true}
                      type="number"
                      min="2"
                      id="maxPrice"
                      value={maxPrice === 0 ? '' : maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                    />
                  </li>
                </div>
                <div className={styles.debContainer}>
                  <div className={styles.infoText}>Установите дедлайн</div>
                  <li>
                    <label htmlFor="deadline">
                      Желаемая дата полной ликвидации:{' '}
                    </label>
                    <input
                      required={true}
                      type="text"
                      id="deadline"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </li>
                  <div className={styles.infoText}>Установите погрешность</div>
                  <li>
                    <label htmlFor="errorDays">Допуск по дням: </label>
                    <input
                      required={true}
                      type="number"
                      min="1"
                      id="errorDays"
                      value={errorDays === 0 ? '' : errorDays}
                      onChange={(e) => setErrorDays(Number(e.target.value))}
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
            {selectedCategory === '' ? (
              <></>
            ) : (
              <div className={styles.infoText}>Выберите артикулы</div>
            )}
            <div className={styles.textFilter}>
              {selectedCategory === '' ? <></> : <SkuNameFilter />}
            </div>
            <div>
              {selectedCategory === '' ? (
                <></>
              ) : (
                <div className={styles.tagsFilters}>
                  <TaskMainTagFilter options={tagsMain} />
                  <TaskClothTagFilter options={tagsCloth} />
                  <TaskOthersTagFilter options={tagsOthers} />
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
              )}
            </div>
            <div className={styles.skuGrid}>
              {isLoading ? (
                <FaSpinner className="spinner" />
              ) : selectedCategory === '' ? (
                <></>
              ) : (
                filteredSkuDataWCat.map((sku) => {
                  return (
                    <div
                      key={uuidv4()}
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
            Создать
            <p className={styles.buttonPara}>
              После создания задачи, она будет неактивной, чтобы начать
              автоматически менять цены, запустите ее.
            </p>
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
              2. Алгоритм будет стараться попасть в дедлайн с ошибкой в N дней,
              установленных в погрешности.
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

export default TaskCreateDrain;
