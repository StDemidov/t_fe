import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { selectNotificationMessage } from '../../redux/slices/notificationSlice';

import {
  fetchAucCampaignByIdMain,
  selectCmpgnSingle,
  selectIsLoading,
  editAucCampaign,
} from '../../redux/slices/aucCampaignsSlice';
import { FaSpinner } from 'react-icons/fa';

import { setError } from '../../redux/slices/errorSlice';
import styles from './style.module.css';
import { hostName } from '../../utils/host';

const AuctionCampaignEditMain = () => {
  const dispatch = useDispatch();
  const notificationMessage = useSelector(selectNotificationMessage);
  const isLoading = useSelector(selectIsLoading);
  const navigation = useNavigate();
  const cmpgn = useSelector(selectCmpgnSingle);
  let { id } = useParams();

  const [campName, setCampName] = useState('');
  const [whenToPause, setWhenToPause] = useState(0);
  const [whenToAddBudget, setWhenToAddBudget] = useState(0);
  const [howMuchToAdd, setHowMuchToAdd] = useState(0);
  const [highCPM, setHighCPM] = useState(200);
  const [lowCPM, setLowCPM] = useState(150);

  useEffect(() => {
    if (notificationMessage !== '') {
      navigation(`/tools/auction_campaigns`);
    }
  }, [notificationMessage, navigation]);

  useEffect(() => {
    dispatch(
      fetchAucCampaignByIdMain(`${hostName}/auctioncampaigns/main_by_id/${id}`)
    );
  }, []);

  useEffect(() => {
    if (cmpgn) {
      setCampName(cmpgn?.vcName);
      setHighCPM(cmpgn?.highCPM);
      setLowCPM(cmpgn?.lowCPM);
      setWhenToPause(cmpgn?.whenToPause);
      setWhenToAddBudget(cmpgn?.whenToAddBudget);
      setHowMuchToAdd(cmpgn?.howMuchToAdd);
    }
  }, [cmpgn]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (highCPM <= 0) {
      dispatch(setError('Установите CPM для ВЧ кампании!'));
    } else if (lowCPM <= 0) {
      dispatch(setError('Установите CPM для НЧ кампании!'));
    } else if (whenToAddBudget < 1000) {
      dispatch(setError('Установите порог пополнения бюджета больше 1000!'));
    } else if (howMuchToAdd < 1000) {
      dispatch(setError('Установите сумму пополнения не менее 1000!'));
    } else {
      const data = {
        camp_id: Number(id),
        high_freq_cpm: highCPM,
        low_freq_cpm: lowCPM,
        when_to_pause: whenToPause,
        when_to_add_budget: whenToAddBudget,
        how_much_to_add: howMuchToAdd,
      };
      dispatch(
        editAucCampaign({
          data: data,
          url: `${hostName}/auctioncampaigns/edit_main`,
        })
      );
    }
  };

  return (
    <section>
      <h1>Редактирование всех кампаний для {campName}</h1>
      <div className={styles.mainContainer}>
        <div className={styles.formContainer}>
          {isLoading ? (
            <div className={styles.loader}>
              <FaSpinner className="spinner" />
              Кампания редактируется. <br />
              Пока процесс не завершится, не создавайте новые кампании и не
              уходите с этой страницы.
            </div>
          ) : (
            <form id="cmpgnEdit" onSubmit={handleSubmit}>
              <ul>
                <div className={styles.settingsContainer}>
                  <div className={styles.pricesContainer}>
                    <div className={styles.infoText}>
                      Пауза по оборачиваемости:
                    </div>
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
                      />
                    </li>
                  </div>
                  <div className={styles.debContainer}>
                    <div className={styles.infoText}>CPM:</div>
                    <li>
                      <label htmlFor="highCPM">CPM ВЧ кампании: </label>
                      <input
                        required={true}
                        type="number"
                        min="0"
                        id="highCPM"
                        value={highCPM === 0 ? '' : highCPM}
                        onChange={(e) => setHighCPM(e.target.value)}
                      />
                    </li>
                    <li>
                      <label htmlFor="lowCPM">CPM НЧ кампаний: </label>
                      <input
                        required={true}
                        type="number"
                        min="0"
                        id="lowCPM"
                        value={lowCPM === 0 ? '' : lowCPM}
                        onChange={(e) => setLowCPM(e.target.value)}
                      />
                    </li>
                  </div>
                </div>
              </ul>
            </form>
          )}
        </div>

        <div className={styles.infoContainer}>
          {!isLoading ? (
            <button
              type="submit"
              form="cmpgnEdit"
              className={styles.buttonAccept}
            >
              Применить изменения
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

export default AuctionCampaignEditMain;
