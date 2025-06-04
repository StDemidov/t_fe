import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { selectNotificationMessage } from '../../redux/slices/notificationSlice';

import {
  editAutoCampaign,
  selectCmpgnSingle,
  fetchAutoCampaignById,
} from '../../redux/slices/autoCampaignsSlice';

import { setError } from '../../redux/slices/errorSlice';
import styles from './style.module.css';
import { hostName } from '../../utils/host';

const AutoCampaignEdit = () => {
  const dispatch = useDispatch();
  const notificationMessage = useSelector(selectNotificationMessage);
  const navigation = useNavigate();
  const cmpgn = useSelector(selectCmpgnSingle);
  let { id } = useParams();

  const [campName, setCampName] = useState('');
  const [ctrBench, setCtrBench] = useState(0);
  const [viewsBench, setViewsBench] = useState(0);
  const [whenToPause, setWhenToPause] = useState(0);
  const [whenToAddBudget, setWhenToAddBudget] = useState(0);
  const [howMuchToAdd, setHowMuchToAdd] = useState(0);
  const [hasActiveHours, setHasActiveHours] = useState(false);
  const [startHour, setStartHour] = useState(0);
  const [endHour, setEndHour] = useState(23);

  useEffect(() => {
    if (notificationMessage !== '') {
      navigation(`/tools/auto_campaigns`);
    }
  }, [notificationMessage, navigation]);

  useEffect(() => {
    dispatch(fetchAutoCampaignById(`${hostName}/autocampaigns/by_id/${id}`));
  }, []);

  useEffect(() => {
    if (cmpgn) {
      setCampName(cmpgn?.campName);
      setCtrBench(cmpgn?.ctrBench);
      setViewsBench(cmpgn?.viewsBench);
      setWhenToPause(cmpgn?.whenToPause);
      setWhenToAddBudget(cmpgn?.whenToAddBudget);
      setHowMuchToAdd(cmpgn?.howMuchToAdd);
      setHasActiveHours(cmpgn?.hasActiveHours);
      setStartHour(cmpgn?.startHour);
      setEndHour(cmpgn?.endHour);
    }
  }, [cmpgn]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ctrBench <= 0) {
      dispatch(setError('Установите пороговый CTR!'));
    } else if (viewsBench < 10) {
      dispatch(setError('Установите порог по просмотрам выше 10!'));
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
        editAutoCampaign({
          data: data,
          url: `${hostName}/autocampaigns/${id}`,
        })
      );
    }
  };

  return (
    <section>
      <h1>{campName}</h1>
      <div className={styles.mainContainer}>
        <div className={styles.formContainer}>
          <form id="cmpgnEdit" onSubmit={handleSubmit}>
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
          </form>
        </div>
        <div className={styles.infoContainer}>
          <button
            type="submit"
            form="cmpgnEdit"
            className={styles.buttonAccept}
          >
            Принять изменения
          </button>
          {/* <div className={styles.description}>
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
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default AutoCampaignEdit;
