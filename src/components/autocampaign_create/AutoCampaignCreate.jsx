import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { selectNotificationMessage } from '../../redux/slices/notificationSlice';

import {
  createAutoCampaign,
  fetchSkuData,
  selectSkuDataAutoCmpgns,
  selectIsLoading,
} from '../../redux/slices/autoCampaignsSlice';

import { selectSkuOrNameTasksFilter } from '../../redux/slices/filterSlice';

import SkuNameFilter from '../price-cotrol-page/sku-name-filter/SkuNameFilter';

import { setError } from '../../redux/slices/errorSlice';
import styles from './style.module.css';
import { hostName } from '../../utils/host';

const AutoCampaignCreate = () => {
  const dispatch = useDispatch();
  const notificationMessage = useSelector(selectNotificationMessage);
  const skuData = useSelector(selectSkuDataAutoCmpgns);
  const isLoading = useSelector(selectIsLoading);
  const skuOrNameFilter = useSelector(selectSkuOrNameTasksFilter);
  const navigation = useNavigate();

  useEffect(() => {
    if (notificationMessage !== '') {
      navigation(`/tools/auto_campaigns`);
    }
  }, [notificationMessage, navigation]);

  useEffect(() => {
    dispatch(fetchSkuData(`${hostName}/autocampaigns/sku_data`));
  }, [dispatch]);

  const [currBudget, setCurrBudget] = useState(5000);
  const [cpm, setCpm] = useState(150);
  const [ctrBench, setCtrBench] = useState(2);
  const [viewsBench, setViewsBench] = useState(50);
  const [whenToPause, setWhenToPause] = useState(5);
  const [whenToAddBudget, setWhenToAddBudget] = useState(3000);
  const [howMuchToAdd, setHowMuchToAdd] = useState(2000);
  const [startHour, setStartHour] = useState(0);
  const [endHour, setEndHour] = useState(23);
  const [hasActiveHours, setHasActiveHours] = useState(false);
  const [sku, setSku] = useState('');

  const filteredSkuDataWCat = skuData.filter((sku) => {
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
    if (currBudget < 2000) {
      dispatch(setError('Бюджет должен быть выше 2000!'));
    } else if (ctrBench <= 0) {
      dispatch(setError('Установите пороговый CTR!'));
    } else if (cpm < 120) {
      dispatch(setError('Установите CPM выше 120!'));
    } else if (viewsBench < 10) {
      dispatch(setError('Установите порог по просмотрам выше 10!'));
    } else if (sku === '') {
      dispatch(setError('Необходимо выбрать артикул!'));
    } else if (whenToAddBudget < 1000) {
      dispatch(setError('Установите порог пополнения бюджета больше 1000!'));
    } else if (howMuchToAdd < 1000) {
      dispatch(setError('Установите сумму пополнения не менее 1000!'));
    } else if (hasActiveHours && startHour === endHour) {
      dispatch(
        setError('Время старта и окончания работы кампании должны отличаться!')
      );
    } else {
      const data = {
        sku: sku,
        curr_budget: currBudget,
        cpm: cpm,
        ctr_bench: ctrBench * 100,
        views_bench: viewsBench,
        when_to_pause: whenToPause,
        when_to_add_budget: whenToAddBudget,
        how_much_to_add: howMuchToAdd,
        has_active_hours: hasActiveHours,
        ...(hasActiveHours && {
          start_hour: startHour,
          end_hour: endHour,
        }),
      };
      dispatch(
        createAutoCampaign({
          data: data,
          url: `${hostName}/autocampaigns/`,
        })
      );
    }
  };

  const handeClickOnVC = (e) => {
    const sku = e.currentTarget.getAttribute('data-value');
    setSku(sku);
  };
  return (
    <section>
      <h1>Новая автоматическая кампания</h1>
      <div className={styles.mainContainer}>
        <div className={styles.formContainer}>
          <form id="cmpgnCreate" onSubmit={handleSubmit}>
            <ul>
              <div className={styles.settingsContainer}>
                <div className={styles.pricesContainer}>
                  <div className={styles.infoText}>Установите бенчмарки</div>
                  <li>
                    <label htmlFor="ctrBench">Пороговый CTR (%): </label>
                    <input
                      required={true}
                      type="number"
                      id="ctrBench"
                      value={ctrBench === 0 ? '' : ctrBench}
                      onChange={(e) => setCtrBench(Number(e.target.value))}
                      className={styles.disabledScroll}
                    />
                  </li>
                  <li>
                    <label htmlFor="viewsBench">Порог просмотров: </label>
                    <input
                      required={true}
                      type="number"
                      min="10"
                      id="viewsBench"
                      value={viewsBench === 0 ? '' : viewsBench}
                      onChange={(e) => setViewsBench(Number(e.target.value))}
                      className={styles.disabledScroll}
                    />
                  </li>
                  <li>
                    <label htmlFor="whenToPause">
                      Минимальная оборачиваемость:{' '}
                    </label>
                    <input
                      required={true}
                      type="number"
                      min="-100"
                      id="whenToPause"
                      value={whenToPause === 0 ? '' : whenToPause}
                      onChange={(e) => setWhenToPause(Number(e.target.value))}
                      className={styles.disabledScroll}
                    />
                  </li>
                  <div className={styles.infoText}>Бюджет</div>
                  <li>
                    <label htmlFor="currBudget">Стартовый бюджет: </label>
                    <input
                      required={true}
                      type="number"
                      min="1000"
                      id="currBudget"
                      value={currBudget === 0 ? '' : currBudget}
                      onChange={(e) => setCurrBudget(Number(e.target.value))}
                      className={styles.disabledScroll}
                    />
                  </li>
                </div>
                <div className={styles.debContainer}>
                  <div className={styles.infoText}>Автопополнение:</div>
                  <li>
                    <label htmlFor="whenToAddBudget">
                      Нижний порог бюджета:{' '}
                    </label>
                    <input
                      required={true}
                      type="number"
                      min="1000"
                      id="whenToAddBudget"
                      value={whenToAddBudget === 0 ? '' : whenToAddBudget}
                      onChange={(e) => setWhenToAddBudget(e.target.value)}
                      className={styles.disabledScroll}
                    />
                  </li>
                  <li>
                    <label htmlFor="howMuchToAdd">Сумма пополнения: </label>
                    <input
                      required={true}
                      type="number"
                      min="1000"
                      id="howMuchToAdd"
                      value={howMuchToAdd === 0 ? '' : howMuchToAdd}
                      onChange={(e) => setHowMuchToAdd(e.target.value)}
                      className={styles.disabledScroll}
                    />
                  </li>
                  <li>
                    <label htmlFor="whenToAddBudget">CPM: </label>
                    <input
                      required={true}
                      type="number"
                      min="100"
                      id="cpm"
                      value={cpm === 0 ? '' : cpm}
                      onChange={(e) => setCpm(e.target.value)}
                      className={styles.disabledScroll}
                    />
                  </li>
                </div>
              </div>
            </ul>

            <div className={styles.infoText}>Часы активности</div>
            <div className={styles.timeToggle}>
              <input
                type="checkbox"
                checked={hasActiveHours}
                onChange={(e) => setHasActiveHours(e.target.checked)}
              />
              <div>Установить часы активности кампании</div>
            </div>

            {hasActiveHours && (
              <div className={styles.timePicker}>
                <li>
                  <label htmlFor="startHour">Начало (час): </label>
                  <select
                    id="startHour"
                    value={startHour}
                    onChange={(e) => setStartHour(Number(e.target.value))}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i}:00
                      </option>
                    ))}
                  </select>
                </li>
                <li>
                  <label htmlFor="endHour">Окончание (час): </label>
                  <select
                    id="endHour"
                    value={endHour}
                    onChange={(e) => setEndHour(Number(e.target.value))}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i}:00
                      </option>
                    ))}
                  </select>
                </li>
              </div>
            )}

            <div className={styles.infoText}>Выберите артикул</div>
            <div className={styles.textFilter}>
              <SkuNameFilter />
            </div>
            <div className={styles.skuGrid}>
              {isLoading ? (
                <FaSpinner className="spinner" />
              ) : (
                filteredSkuDataWCat.map((item) => {
                  return (
                    <div
                      key={uuidv4()}
                      className={
                        item.sku === sku
                          ? styles.singleSkuChosen
                          : styles.singleSku
                      }
                      onClick={handeClickOnVC}
                      data-value={item.sku}
                    >
                      <img src={item.image} alt={item.vcName} />
                      <div>{highlightMatch(item.vcName, skuOrNameFilter)}</div>
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
            form="cmpgnCreate"
            className={styles.buttonAccept}
          >
            Создать
            <p className={styles.buttonPara}>
              После создания кампании, она сразу станет активной.
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

export default AutoCampaignCreate;
