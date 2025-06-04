import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { selectNotificationMessage } from '../../redux/slices/notificationSlice';
import { FaEye } from 'react-icons/fa';
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
  const [cpm, setCPM] = useState(150);
  const [ctrBench, setCTRBench] = useState(0);
  const [viewsBench, setViewsBench] = useState(0);
  const [topWords, setTopWords] = useState([]);
  const [exclNum, setExclNum] = useState([]);
  const [newExcl, setNewExcl] = useState([]);

  useEffect(() => {
    if (notificationMessage !== '') {
      navigation(`/tools/auction_campaigns`);
    }
  }, [notificationMessage, navigation]);

  useEffect(() => {
    dispatch(
      fetchAucCampaignByIdMain(
        `${hostName}/auctioncampaigns/main_by_id_new/${id}`
      )
    );
  }, []);

  useEffect(() => {
    if (cmpgn) {
      setCampName(cmpgn?.vcName);
      setCPM(cmpgn?.cpm);
      setWhenToPause(cmpgn?.whenToPause);
      setWhenToAddBudget(cmpgn?.whenToAddBudget);
      setHowMuchToAdd(cmpgn?.howMuchToAdd);
      setCTRBench(cmpgn?.ctrBench * 100);
      setViewsBench(cmpgn?.viewsBench);
      setExclNum(cmpgn?.exclNum);
      cmpgn.topWords
        ? setTopWords(cmpgn.topWords.split(','))
        : setTopWords(NaN);
    }
  }, [cmpgn]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cpm <= 0) {
      dispatch(setError('Установите CPM не ниже 150!'));
    } else if (whenToAddBudget < 1000) {
      dispatch(setError('Установите порог пополнения бюджета больше 1000!'));
    } else if (howMuchToAdd < 1000) {
      dispatch(setError('Установите сумму пополнения не менее 1000!'));
    } else if (ctrBench <= 0) {
      dispatch(setError('Установите пороговый CTR!'));
    } else if (viewsBench <= 0) {
      dispatch(setError('Установите порог по просмотрам!'));
    } else {
      const data = {
        camp_id: Number(id),
        cpm: cpm,
        ctr_bench: ctrBench,
        views_bench: viewsBench,
        new_excl: newExcl,
        when_to_pause: whenToPause,
        when_to_add_budget: whenToAddBudget,
        how_much_to_add: howMuchToAdd,
      };
      dispatch(
        editAucCampaign({
          data: data,
          url: `${hostName}/auctioncampaigns/edit_main_new`,
        })
      );
    }
  };

  const handeClickOnWord = (e) => {
    const word = e.currentTarget.getAttribute('data-value');
    if (newExcl.includes(word)) {
      const newList = newExcl.filter((elem) => {
        return elem !== word;
      });
      setNewExcl(newList);
    } else {
      if (exclNum + newExcl.length < 1000) {
        setNewExcl([].concat(newExcl, word));
      }
    }
  };

  return (
    <section>
      <h1>Редактирование кампании для {campName}</h1>
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
                    <div className={styles.infoText}>Пороги:</div>
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
                    <li>
                      <label htmlFor="ctrBench">Пороговый CTR: </label>
                      <input
                        required={true}
                        type="number"
                        id="ctrBench"
                        value={ctrBench === 0 ? '' : ctrBench}
                        onChange={(e) => setCTRBench(Number(e.target.value))}
                        className={styles.disabledScroll}
                      />
                    </li>
                    <li>
                      <label htmlFor="viewsBench">Порог по просмотрам: </label>
                      <input
                        required={true}
                        type="number"
                        min="0"
                        id="viewsBench"
                        value={viewsBench === 0 ? '' : viewsBench}
                        onChange={(e) => setViewsBench(Number(e.target.value))}
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
                  <div className={styles.debContainer}>
                    <div className={styles.infoText}>CPM:</div>
                    <li>
                      <label htmlFor="CPM">CPM кампании: </label>
                      <input
                        required={true}
                        type="number"
                        min="0"
                        id="CPM"
                        value={cpm === 0 ? '' : cpm}
                        onChange={(e) => setCPM(e.target.value)}
                        className={styles.disabledScroll}
                      />
                    </li>
                  </div>
                </div>
              </ul>

              <div className={styles.infoText}>
                {topWords && exclNum < 1000 ? (
                  <>
                    Топ тратящих ключей{' '}
                    {exclNum + newExcl.length >= 1000
                      ? '(Достигнут лимит)'
                      : ''}
                    :
                    <div className={styles.topWordsBlock}>
                      {topWords.map((item) => {
                        let word = item.split(';');
                        return (
                          <div
                            className={
                              newExcl.includes(item)
                                ? styles.chosenWord
                                : styles.word
                            }
                            onClick={handeClickOnWord}
                            data-value={item}
                          >
                            <div>{word[0]}</div>
                            <div className={styles.wordStats}>
                              <div>{word[1]}</div>
                              <div>CTR: {(word[2] * 100).toFixed(2)} %</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    Невозможно добавить исключения{' '}
                    {exclNum >= 1000 ? '(достигнут лимит)' : ''}
                  </>
                )}
              </div>
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
