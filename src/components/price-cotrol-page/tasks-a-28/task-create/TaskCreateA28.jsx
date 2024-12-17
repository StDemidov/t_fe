import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { selectNotificationMessage } from '../../../../redux/slices/notificationSlice';

import {
  createTaskA28,
  fetchSkuData,
  selectSkuData,
  selectIsLoading,
} from '../../../../redux/slices/tasksA28Slice';
import {
  selectTasksCategory,
  resetTasksCategory,
  resetSkuOrNameTasksFilter,
  selectSkuOrNameTasksFilter,
} from '../../../../redux/slices/filterSlice';
import {
  fetchCategories,
  selectCategories,
} from '../../../../redux/slices/categorySlice';
import CategoryFilterTasks from '../../category-filter-tasks/CategoryFilterTasks';
import SkuNameFilter from '../../sku-name-filter/SkuNameFilter';
import { setError } from '../../../../redux/slices/errorSlice';
import styles from './style.module.css';
import { hostName } from '../../../../utils/host';

const TaskCreateA28 = () => {
  const dispatch = useDispatch();
  const notificationMessage = useSelector(selectNotificationMessage);
  const skuData = useSelector(selectSkuData);
  const isLoading = useSelector(selectIsLoading);
  const allCategories = useSelector(selectCategories);
  const selectedCategory = useSelector(selectTasksCategory);
  const skuOrNameFilter = useSelector(selectSkuOrNameTasksFilter);
  const navigation = useNavigate();

  useEffect(() => {
    if (notificationMessage !== '') {
      dispatch(resetTasksCategory());
      navigation(`/tools/tasks_a_28`);
    }
  }, [notificationMessage]);

  useEffect(() => {
    dispatch(resetTasksCategory());
    dispatch(fetchCategories(`${hostName}/category/`));
    dispatch(fetchSkuData(`${hostName}/price_control_a_28/`));
  }, [dispatch]);

  useEffect(() => {
    setSkuList([]);
    dispatch(resetSkuOrNameTasksFilter());
  }, [selectedCategory]);

  const [taskName, setTaskName] = useState('');
  const [priceAAA, setPriceAAA] = useState(0);
  const [priceA, setPriceA] = useState(0);
  const [priceB, setPriceB] = useState(0);
  const [priceBC10, setPriceBC10] = useState(0);
  const [priceBC30, setPriceBC30] = useState(0);
  const [priceC, setPriceC] = useState(0);
  const [priceG, setPriceG] = useState(0);
  const [debAAA, setDebAAA] = useState(0);
  const [debA, setDebA] = useState(0);
  const [debB, setDebB] = useState(0);
  const [debBC10, setDebBC10] = useState(0);
  const [debBC30, setDebBC30] = useState(0);
  const [debC, setDebC] = useState(0);
  const [skuList, setSkuList] = useState([]);

  const filteredSkuData = skuData.filter((sku) => {
    return !sku.taskId;
  });

  const filteredSkuDataWCat = filteredSkuData.filter((sku) => {
    let categoryMatch = true;
    let skuOrNameMatch = true;
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
    return categoryMatch && skuOrNameMatch;
  });

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
    if (taskName === '') {
      dispatch(setError('Название должно быть заполнено!'));
    } else if (
      priceAAA < 1 ||
      priceA < 1 ||
      priceB < 1 ||
      priceBC10 < 1 ||
      priceBC30 < 1 ||
      priceC < 1 ||
      priceG < 1 ||
      debAAA < 1 ||
      debA < 1 ||
      debB < 1 ||
      debBC10 < 1 ||
      debBC30 < 1 ||
      debC < 1
    ) {
      dispatch(setError('Все значения должны быть больше 1!'));
    } else if (skuList.length === 0) {
      dispatch(setError('Необходимо выбрать хотя бы 1 артикул!'));
    } else {
      const data = {
        task_name: taskName,
        price_aaa: priceAAA,
        price_a: priceA,
        price_b: priceB,
        price_bc10: priceBC10,
        price_bc30: priceBC30,
        price_c: priceC,
        price_g: priceG,
        sku_list: skuList.join(','),
        deb_aaa: debAAA,
        deb_a: debA,
        deb_b: debB,
        deb_bc10: debBC10,
        deb_bc30: debBC30,
        deb_c: debC,
      };
      dispatch(
        createTaskA28({
          data: data,
          url: '${hostName}/tasksa28/',
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
  return (
    <section>
      <h1>Новая задача (После 28 дня)</h1>
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
                  <div className={styles.infoText}>Установите цены</div>
                  <li>
                    <label htmlFor="priceAAA">Категория ААА: </label>
                    <input
                      required={true}
                      type="number"
                      min="1"
                      id="priceAAA"
                      value={priceAAA === 0 ? '' : priceAAA}
                      onChange={(e) => setPriceAAA(Number(e.target.value))}
                    />
                  </li>
                  <li>
                    <label htmlFor="priceA">Категория А: </label>
                    <input
                      required={true}
                      type="number"
                      min="1"
                      id="priceA"
                      value={priceA === 0 ? '' : priceA}
                      onChange={(e) => setPriceA(Number(e.target.value))}
                    />
                  </li>
                  <li>
                    <label htmlFor="priceB">Категория B: </label>
                    <input
                      required={true}
                      type="number"
                      min="1"
                      id="priceB"
                      value={priceB === 0 ? '' : priceB}
                      onChange={(e) => setPriceB(Number(e.target.value))}
                    />
                  </li>
                  <li>
                    <label htmlFor="priceBC10">Категория BC10: </label>
                    <input
                      required={true}
                      type="number"
                      min="1"
                      id="priceBC10"
                      value={priceBC10 === 0 ? '' : priceBC10}
                      onChange={(e) => setPriceBC10(Number(e.target.value))}
                    />
                  </li>
                  <li>
                    <label htmlFor="priceBC30">Категория BC30: </label>
                    <input
                      required={true}
                      type="number"
                      min="1"
                      id="priceBC30"
                      value={priceBC30 === 0 ? '' : priceBC30}
                      onChange={(e) => setPriceBC30(Number(e.target.value))}
                    />
                  </li>
                  <li>
                    <label htmlFor="priceC">Категория C: </label>
                    <input
                      required={true}
                      type="number"
                      min="1"
                      id="priceC"
                      value={priceC === 0 ? '' : priceC}
                      onChange={(e) => setPriceC(Number(e.target.value))}
                    />
                  </li>
                  <li>
                    <label htmlFor="priceG">Категория G: </label>
                    <input
                      required={true}
                      type="number"
                      min="1"
                      id="priceG"
                      value={priceG === 0 ? '' : priceG}
                      onChange={(e) => setPriceG(Number(e.target.value))}
                    />
                  </li>
                </div>
                <div className={styles.debContainer}>
                  <div className={styles.infoText}>Установите пороги</div>
                  <li>
                    <label htmlFor="debAAA">Категория ААА: </label>
                    <input
                      required={true}
                      type="number"
                      min="1"
                      id="debAAA"
                      value={debAAA === 0 ? '' : debAAA}
                      onChange={(e) => setDebAAA(Number(e.target.value))}
                    />
                  </li>
                  <li>
                    <label htmlFor="debA">Категория А: </label>
                    <input
                      required={true}
                      type="number"
                      min="1"
                      id="debA"
                      value={debA === 0 ? '' : debA}
                      onChange={(e) => setDebA(Number(e.target.value))}
                    />
                  </li>
                  <li>
                    <label htmlFor="debB">Категория B: </label>
                    <input
                      required={true}
                      type="number"
                      min="1"
                      id="debB"
                      value={debB === 0 ? '' : debB}
                      onChange={(e) => setDebB(Number(e.target.value))}
                    />
                  </li>
                  <li>
                    <label htmlFor="debBC10">Категория BC10: </label>
                    <input
                      required={true}
                      type="number"
                      min="1"
                      id="debBC10"
                      value={debBC10 === 0 ? '' : debBC10}
                      onChange={(e) => setDebBC10(Number(e.target.value))}
                    />
                  </li>
                  <li>
                    <label htmlFor="debBC30">Категория BC30: </label>
                    <input
                      required={true}
                      type="number"
                      min="1"
                      id="debBC30"
                      value={debBC30 === 0 ? '' : debBC30}
                      onChange={(e) => setDebBC30(Number(e.target.value))}
                    />
                  </li>
                  <li>
                    <label htmlFor="debC">Категория C: </label>
                    <input
                      required={true}
                      type="number"
                      min="1"
                      id="debC"
                      value={debC === 0 ? '' : debC}
                      onChange={(e) => setDebC(Number(e.target.value))}
                    />
                  </li>
                </div>
              </div>
            </ul>

            {selectedCategory === '' ? (
              <></>
            ) : (
              <div className={styles.infoText}>Выберите артикулы</div>
            )}
            <div className={styles.textFilter}>
              {selectedCategory === '' ? <></> : <SkuNameFilter />}
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
              2. В одну задачу нельзя добавлять артикулы из разных категорий.
              <br />
              3. Перед заведение задачи посмотрите работу алгоритма.
              <br />
              4. Каждый артикул можно добавить только в одну задачу данного
              типа, если артикула нет в списке, возможно, он уже привязан к
              другой задаче
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TaskCreateA28;
