import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectNotificationMessage } from '../../redux/slices/notificationSlice';

import {
  fetchDefaultSettings,
  selectDefaultSettings,
  setDefaultSettings,
} from '../../redux/slices/aucCampaignsSlice';

import { setError } from '../../redux/slices/errorSlice';
import styles from './style.module.css';
import { hostName } from '../../utils/host';

const AuctionCampaignDefaultSettings = () => {
  const dispatch = useDispatch();
  const notificationMessage = useSelector(selectNotificationMessage);
  const navigation = useNavigate();

  useEffect(() => {
    if (notificationMessage !== '') {
      navigation(`/tools/auction_campaigns`);
    }
  }, [notificationMessage, navigation]);

  useEffect(() => {
    dispatch(fetchDefaultSettings(`${hostName}/auction_campaigns_settings/`));
  }, [dispatch]);

  const settings = useSelector(selectDefaultSettings);

  const [budget, setBudget] = useState(settings.budget);
  const [cpm, setCpm] = useState(settings.cpm);
  const [ctrBench, setCtrBench] = useState(settings.ctrBench);
  const [viewsBench, setViewsBench] = useState(settings.viewsBench);
  const [whenToPause, setWhenToPause] = useState(settings.whenToPause);
  const [whenToAddBudget, setWhenToAddBudget] = useState(
    settings.whenToAddBudget
  );
  const [howMuchToAdd, setHowMuchToAdd] = useState(settings.howMuchToAdd);

  const [byBc, setByBc] = useState(settings.byBc);
  const [daysForTurnover, setDaysForTurnover] = useState(
    settings.daysForTurnover
  );
  useEffect(() => {
    if (settings) {
      setBudget(settings.budget);
      setCpm(settings.cpm);
      setCtrBench(settings.ctrBench);
      setViewsBench(settings.viewsBench);
      setWhenToPause(settings.whenToPause);
      setWhenToAddBudget(settings.whenToAddBudget);
      setHowMuchToAdd(settings.howMuchToAdd);
      setByBc(settings.byBc);
      setDaysForTurnover(settings.daysForTurnover);
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (budget < 2000) {
      dispatch(setError('Бюджет должен быть выше 2000!'));
    } else if (ctrBench <= 0) {
      dispatch(setError('Установите пороговый CTR!'));
    } else if (cpm < 120) {
      dispatch(setError('Установите CPM выше 120!'));
    } else if (viewsBench < 10) {
      dispatch(setError('Установите порог по просмотрам выше 10!'));
    } else if (whenToAddBudget < 1000) {
      dispatch(setError('Установите порог пополнения бюджета больше 1000!'));
    } else if (daysForTurnover < 0) {
      dispatch(
        setError('Установите кол-во дней для проверки оборачиваемости!')
      );
    } else if (howMuchToAdd < 1000) {
      dispatch(setError('Установите сумму пополнения не менее 1000!'));
    } else {
      const data = {
        budget: budget,
        cpm: cpm,
        ctr_bench: ctrBench * 100,
        views_bench: viewsBench,
        when_to_pause: whenToPause,
        when_to_add_budget: whenToAddBudget,
        how_much_to_add: howMuchToAdd,
        by_bc: byBc,
        days_for_turnover: daysForTurnover,
      };
      dispatch(
        setDefaultSettings({
          data: data,
          url: `${hostName}/auction_campaigns_settings/`,
        })
      );
    }
  };

  return (
    <section>
      <h1>Настройки по умолчанию для автоматических кампаний</h1>
      <div className={styles.mainContainer}>
        <div className={styles.formContainer}>
          <form id="settingsUpdate" onSubmit={handleSubmit}>
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
                      step="0.01"
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
                    <label htmlFor="budget">Стартовый бюджет: </label>
                    <input
                      required={true}
                      type="number"
                      min="1000"
                      id="budget"
                      value={budget === 0 ? '' : budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
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
                  <div className={styles.infoText}>Оборачиваемость</div>
                  <li>
                    <label htmlFor="daysForTurnover">
                      Кол-во дней для проверки оборачиваемости:{' '}
                    </label>
                    <input
                      required={true}
                      type="number"
                      min="1"
                      id="daysForTurnover"
                      value={daysForTurnover === 0 ? '' : daysForTurnover}
                      onChange={(e) =>
                        setDaysForTurnover(Number(e.target.value))
                      }
                      className={styles.disabledScroll}
                    />
                  </li>
                </div>
              </div>
            </ul>

            <div className={styles.infoText}>Смотреть оборачиваемость по</div>
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
          </form>
        </div>
        <div className={styles.infoContainer}>
          <button
            type="submit"
            form="settingsUpdate"
            className={styles.buttonAccept}
          >
            Применить изменения
          </button>
        </div>
      </div>
    </section>
  );
};

export default AuctionCampaignDefaultSettings;
