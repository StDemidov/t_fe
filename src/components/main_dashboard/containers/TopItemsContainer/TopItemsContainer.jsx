import { format } from 'date-fns';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTopItems,
  selectDashboardDates,
  selectTopItemsData,
  selectTopItemsIsLoading,
} from '../../../../redux/slices/mainDashboardSlice';
import { hostName } from '../../../../utils/host';
import TopItemsTable from './TopItemsTable/TopItemsTable';

const TopItemsContainer = () => {
  const data = useSelector(selectTopItemsData);
  const dates = useSelector(selectDashboardDates);
  const isLoading = useSelector(selectTopItemsIsLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    if (dates.startDate && dates.endDate) {
      const start = format(dates.startDate, 'yyyy-MM-dd');
      const end = format(dates.endDate, 'yyyy-MM-dd');
      dispatch(
        fetchTopItems(
          `${hostName}/dashboards/get_top_items_data?start_date=${start}&end_date=${end}`
        )
      );
    }
  }, [dates]);

  return (
    <TopItemsTable
      data={data}
      endDate={dates.endDate}
      isLoading={isLoading}
    />
  );
};

export default TopItemsContainer;
