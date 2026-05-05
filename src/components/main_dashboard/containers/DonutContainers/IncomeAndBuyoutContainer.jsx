import { format } from 'date-fns';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchIncomeAndBuyoutData,
  fetchInvestedAndStocksData,
  selectDashboardDates,
  selectIncomeAndBuyoutData,
  selectIncomeAndBuyoutIsLoading,
  selectInvestedAndStocksData,
  selectInvestedAndStocksIsLoading,
} from '../../../../redux/slices/mainDashboardSlice';
import { hostName } from '../../../../utils/host';
import DonutChart from './DonutChart/DonutChart';
import styles from './IncomeAndBuyoutContainer.module.css';

const IncomeAndBuyoutContainer = () => {
  const data = useSelector(selectIncomeAndBuyoutData);
  const dataStocks = useSelector(selectInvestedAndStocksData);
  const dates = useSelector(selectDashboardDates);
  const isLoading = useSelector(selectIncomeAndBuyoutIsLoading);
  const isLoadingStocks = useSelector(selectInvestedAndStocksIsLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      fetchInvestedAndStocksData(
        `${hostName}/dashboards/get_invested_and_stocks_data`
      )
    );
  }, []);

  useEffect(() => {
    if (dates.startDate && dates.endDate) {
      const start = format(dates.startDate, 'yyyy-MM-dd');
      const end = format(dates.endDate, 'yyyy-MM-dd');
      dispatch(
        fetchIncomeAndBuyoutData(
          `${hostName}/dashboards/get_income_and_buyout_data?start_date=${start}&end_date=${end}`
        )
      );
    }
  }, [dates]);

  return (
    <div className={styles.row}>
      {/* ── График 1 ── */}
      <div className={styles.chartCell}>
        <DonutChart
          data={data}
          isLoading={isLoading}
          title="Выручка и выкупы"
        />
      </div>
    </div>
  );
};

export default IncomeAndBuyoutContainer;
