import { format } from 'date-fns';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdsData,
  selectAdsStatsData,
  selectAdsStatsIsLoading,
  selectDashboardDates,
  selectDashboardCategory,
  setDashboardCategory,
} from '../../../../redux/slices/mainDashboardSlice';
import { hostName } from '../../../../utils/host';
import AdsChart from './AdsChart/AdsChart';
import CategoryFilter from '../../common/CategoryFilter/CategoryFilter';

const AdsContainer = () => {
  const data = useSelector(selectAdsStatsData);
  const dates = useSelector(selectDashboardDates);
  const isLoading = useSelector(selectAdsStatsIsLoading);
  const category = useSelector(selectDashboardCategory);
  const dispatch = useDispatch();

  useEffect(() => {
    if (dates.startDate && dates.endDate) {
      const start = format(dates.startDate, 'yyyy-MM-dd');
      const end = format(dates.endDate, 'yyyy-MM-dd');
      dispatch(
        fetchAdsData(
          `${hostName}/dashboards/get_ads_costs_cpo_and_cps_data?start_date=${start}&end_date=${end}`
        )
      );
    }
  }, [dates]);

  // Все категории кроме "Всего", по алфавиту
  const categories = useMemo(
    () =>
      Object.keys(data)
        .filter((k) => k !== 'Всего')
        .sort((a, b) => a.localeCompare(b, 'ru')),
    [data]
  );

  // '' → показываем "Всего"
  const activeKey = category || 'Всего';
  const chartData = data[activeKey] ?? {};

  const filterSlot = (
    <CategoryFilter
      categories={categories}
      value={category}
      onChange={(val) => dispatch(setDashboardCategory(val))}
    />
  );

  return (
    <AdsChart
      data={chartData}
      isLoading={isLoading}
      title={`Рек. расходы, CPO и CPS${category ? ` — ${category}` : ''}`}
      startDate={dates.startDate}
      endDate={dates.endDate}
      filterSlot={filterSlot}
    />
  );
};

export default AdsContainer;
