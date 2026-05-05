import { format } from 'date-fns';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRoiByCategory,
  selectDashboardDates,
  selectRoiData,
  selectRoiIsLoading,
} from '../../../../redux/slices/mainDashboardSlice';
import { hostName } from '../../../../utils/host';
import RoiChart from './RoiChart/RoiChart';

const RoiContainer = () => {
  const data = useSelector(selectRoiData);
  const dates = useSelector(selectDashboardDates);
  const isLoading = useSelector(selectRoiIsLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    if (dates.startDate && dates.endDate) {
      const start = format(dates.startDate, 'yyyy-MM-dd');
      const end = format(dates.endDate, 'yyyy-MM-dd');
      dispatch(
        fetchRoiByCategory(
          `${hostName}/dashboards/get_roi_by_categories?start_date=${start}&end_date=${end}`
        )
      );
    }
  }, [dates]);

  return <RoiChart data={data} isLoading={isLoading} title="ROI по категориям" />;
};

export default RoiContainer;
