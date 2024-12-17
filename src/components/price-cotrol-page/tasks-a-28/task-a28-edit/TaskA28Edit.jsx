import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { selectNotificationMessage } from '../../../../redux/slices/notificationSlice';

import {
  fetchSkuData,
  selectSkuData,
  selectIsLoading,
  fetchTaskA28ById,
  editTaskA28,
  selectTaskSingle,
} from '../../../../redux/slices/tasksA28Slice';
import { selectSkuOrNameTasksFilter } from '../../../../redux/slices/filterSlice';

import SkuNameFilter from '../../sku-name-filter/SkuNameFilter';
import { setError } from '../../../../redux/slices/errorSlice';
import { hostName } from '../../../../utils/host';
import styles from './style.module.css';

const TaskA28Edit = () => {
  const dispatch = useDispatch();
  const notificationMessage = useSelector(selectNotificationMessage);
  const skuData = useSelector(selectSkuData);
  const taskData = useSelector(selectTaskSingle);
  const isLoading = useSelector(selectIsLoading);
  const skuOrNameFilter = useSelector(selectSkuOrNameTasksFilter);
  const navigation = useNavigate();
  let { id } = useParams();

  const [skuList, setSkuList] = useState([]);

  useEffect(() => {
    if (notificationMessage !== '') {
      navigation(`/tools/tasks_a_28`);
    }
  }, [notificationMessage]);

  useEffect(() => {
    dispatch(fetchTaskA28ById(`${hostName}/tasksa28/${id}`));
    dispatch(fetchSkuData(`${hostName}/price_control_a_28/`));
  }, []);

  useEffect(() => {
    if (taskData.task) {
      setSkuList(taskData?.task?.sku_list.split(','));
    }
  }, [taskData]);

  const filteredSkuData = skuData.filter((sku) => {
    return (
      (!sku.taskId || sku.taskId == id) &&
      sku.categoryId == taskData?.category_id
    );
  });

  const filteredSkuDataWCat = filteredSkuData.filter((sku) => {
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
    return skuOrNameMatch;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (skuList.length === 0) {
      dispatch(setError('Необходимо выбрать хотя бы 1 артикул!'));
    } else {
      const data = {
        sku_list: skuList.join(','),
      };
      if (taskData.task.is_active) {
        dispatch(
          editTaskA28({
            data: data,
            url: `${hostName}/tasksa28/with_reset_skus/${id}`,
          })
        );
      } else {
        dispatch(
          editTaskA28({
            data: data,
            url: `${hostName}/tasksa28/${id}`,
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

  return (
    <section>
      <h1>Редактирование {taskData?.task?.taskName}</h1>
      <div className={styles.mainContainer}>
        <div className={styles.formContainer}>
          <form id="taskEdit" onSubmit={handleSubmit} outside="true">
            <ul>
              <li className={styles.nameInput}>
                <div>{taskData?.task?.taskName}</div>
              </li>
            </ul>

            <div className={styles.infoText}>Выберите артикулы</div>

            <div className={styles.textFilter}>
              <SkuNameFilter />
            </div>

            <div className={styles.skuGrid}>
              {isLoading ? (
                <FaSpinner className="spinner" />
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
          <button type="submit" form="taskEdit" className={styles.buttonAccept}>
            Изменить
            <p className={styles.buttonPara}>
              После редактирования задачи, она будет неактивной, чтобы начать
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
              4. После заведения задачи, она автоматически становится
              неактивной, чтобы запустить ее, нажмите кнопку "Запустить" в меню
              задач.
              <br />
              5. Созданную задачу нельзя изменять, если вы допустили ошибку -
              удалите задачу и создайте новую.
              <br />
              6. В данном типе задач отображаются только свежие артикулы (срок
              жизни меньше 28 дней).
              <br />
              7. Если артикула нет в списке, но он уже появился, значит по нему
              еще не было заказа, артикулы попадают в нашу базу только после
              первого заказа.
              <br />
              8. Заводить задачу необязательно сразу после появления товара,
              крайний срок - 8 день жизни товара.
              <br />
              9. Каждый артикул можно добавить только в одну задачу данного
              типа, если артикула нет в списке, возможно, он уже привязан к
              другой задаче
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TaskA28Edit;
