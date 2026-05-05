import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

import {
  fetchLastUpdate,
  selectLastUpdate,
  selectDashboardDates,
  setDashboardDates,
} from '../../redux/slices/mainDashboardSlice';
import { hostName } from '../../utils/host';
import IncomeAndBuyoutContainer from './containers/DonutContainers/IncomeAndBuyoutContainer';
import InvestedAndStocksContainer from './containers/DonutContainers/InvestedAndStocksContainer';
import RoiContainer from './containers/RoiContainer/RoiContainer';
import AdsContainer from './containers/AdsContainer/AdsContainer';
import TopItemsContainer from './containers/TopItemsContainer/TopItemsContainer';
import FlexCalendar from '../flex_calendar/FlexCalendar';
import styles from './MainDashboardContainer.module.css';

const MainDashboardContainer = () => {
  const lastUpdate = useSelector(selectLastUpdate);
  const dates = useSelector(selectDashboardDates);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!lastUpdate) {
      dispatch(
        fetchLastUpdate(
          `${hostName}/dashboards/get_last_category_metrics_upd_date`
        )
      );
    }
  }, []);

  return (
    <section className={styles.section}>
      <h1>Статистика</h1>

      {lastUpdate && (
        <>
          {/* ── Верхний ряд: [Календарь | Donut1 | Donut2] ── */}
          <div className={styles.dashboardRow}>
            {dates.startDate && dates.endDate && (
              <div className={styles.calCell}>
                <FlexCalendar
                  startDate={dates.startDate}
                  endDate={dates.endDate}
                  maxDate={lastUpdate}
                  onDatesChange={({ startDate, endDate }) =>
                    dispatch(setDashboardDates({ startDate, endDate }))
                  }
                />
              </div>
            )}

            <div className={styles.chartCell}>
              <IncomeAndBuyoutContainer />
            </div>

            <div className={styles.chartCell}>
              <InvestedAndStocksContainer />
            </div>
          </div>

          {/* ── Нижний ряд: [ROI | Реклама] ── */}
          <div className={styles.bottomRow}>
            <div className={styles.bottomCell}>
              <RoiContainer />
            </div>
            <div className={styles.bottomCell}>
              <AdsContainer />
            </div>
          </div>

          {/* ── Таблица топ-артикулов — на всю ширину ── */}
          <div className={styles.tableRow}>
            <TopItemsContainer />
          </div>
        </>
      )}
    </section>
  );
};

export default MainDashboardContainer;
