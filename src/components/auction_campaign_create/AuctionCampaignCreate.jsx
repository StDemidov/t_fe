import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { selectNotificationMessage } from '../../redux/slices/notificationSlice';

import {
  createAucCampaign,
  selectCmpgnSingle,
  fetchAutoCampaignById,
  selectCreatingIsLoading,
} from '../../redux/slices/autoCampaignsSlice';
import { FaSpinner } from 'react-icons/fa';

import { setError } from '../../redux/slices/errorSlice';
import styles from './style.module.css';
import { hostName } from '../../utils/host';

const AuctionCampaignCreate = () => {
  const dispatch = useDispatch();
  const notificationMessage = useSelector(selectNotificationMessage);
  const creatingIsLoading = useSelector(selectCreatingIsLoading);
  const navigation = useNavigate();
  const cmpgn = useSelector(selectCmpgnSingle);
  let { id } = useParams();

  const [campName, setCampName] = useState('');
  const [ctrBench, setCtrBench] = useState(0);
  const [viewsBench, setViewsBench] = useState(0);
  const [whenToPause, setWhenToPause] = useState(0);
  const [whenToAddBudget, setWhenToAddBudget] = useState(2000);
  const [howMuchToAdd, setHowMuchToAdd] = useState(1000);
  const [cpm, setCPM] = useState(150);
  const [sku, setSku] = useState('');
  const [budget, setBudget] = useState(3000);
  const [fixed, setFixed] = useState(true);
  const [byBc, setByBc] = useState(true);

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
      setSku(cmpgn?.sku);
      setByBc(cmpgn?.byBc);
    }
  }, [cmpgn]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ctrBench <= 0) {
      dispatch(setError('Установите пороговый CTR!'));
    } else if (viewsBench < 10) {
      dispatch(setError('Установите порог по просмотрам выше 10!'));
    } else if (cpm <= 149) {
      dispatch(setError('Установите CPM не ниже 150 руб.!'));
    } else if (budget <= 1000) {
      dispatch(setError('Установите бюджет не менее 1000!'));
    } else if (whenToAddBudget < 1000) {
      dispatch(setError('Установите порог пополнения бюджета больше 1000!'));
    } else if (howMuchToAdd < 1000) {
      dispatch(setError('Установите сумму пополнения не менее 1000!'));
    } else {
      const data = {
        parent_id: cmpgn.campId,
        sku: sku,
        ctr_bench: ctrBench * 100,
        views_bench: viewsBench,
        cpm: cpm,
        budget: budget,
        when_to_pause: whenToPause,
        when_to_add_budget: whenToAddBudget,
        how_much_to_add: howMuchToAdd,
        fixed: fixed,
        by_bc: byBc,
      };
      dispatch(
        createAucCampaign({
          data: data,
          url: `${hostName}/auctioncampaigns/create_new`,
        })
      );
    }
  };

  return (
    <section>
      <h1>Перевод {campName} в Аукцион</h1>
      <div className={styles.mainContainer}>
        <div className={styles.formContainer}>
          {creatingIsLoading ? (
            <div className={styles.loader}>
              <FaSpinner className="spinner" />
              Процесс перевода может занять до 2 минут. <br />
              Пока процесс не завершится, не создавайте новые кампании и не
              уходите с этой страницы.
            </div>
          ) : (
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
                        min="-100"
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
                      <label htmlFor="budget">Стартовый бюджет: </label>
                      <input
                        required={true}
                        type="number"
                        min="1000"
                        id="budget"
                        value={budget === 0 ? '' : budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className={styles.disabledScroll}
                      />
                    </li>
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
                  <div className={styles.debContainer}>
                    <div className={styles.infoText}>CPM:</div>
                    <li>
                      <label htmlFor="cpm">CPM кампаний: </label>
                      <input
                        required={true}
                        type="number"
                        min="150"
                        id="cpm"
                        value={cpm === 0 ? '' : cpm}
                        onChange={(e) => setCPM(e.target.value)}
                        className={styles.disabledScroll}
                      />
                    </li>
                  </div>
                </div>
                <div className={styles.infoText}>
                  Смотреть оборачиваемость по
                </div>
                <div className={styles.timeToggle}>
                  <input
                    type="checkbox"
                    checked={byBc}
                    onChange={(e) => setByBc(true)}
                  />
                  <div>Баркодам</div>
                  <input
                    type="checkbox"
                    checked={!byBc}
                    onChange={(e) => setByBc(false)}
                  />
                  <div>Артикулам</div>
                </div>
                <div className={styles.infoText}>Тип кампании</div>
                <li>
                  <label htmlFor="fixed">
                    Использовать фиксированные фразы (иначе - исключения):{' '}
                  </label>
                  <input
                    type="checkbox"
                    id="fixed"
                    checked={fixed}
                    onChange={(e) => setFixed(!fixed)}
                  />
                </li>
              </ul>
            </form>
          )}
        </div>

        <div className={styles.infoContainer}>
          {!creatingIsLoading ? (
            <button
              type="submit"
              form="cmpgnEdit"
              className={styles.buttonAccept}
            >
              Перевести в аукцион
            </button>
          ) : (
            <></>
          )}
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

export default AuctionCampaignCreate;
