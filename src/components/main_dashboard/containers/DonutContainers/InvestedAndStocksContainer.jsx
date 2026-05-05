import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInvestedAndStocksData,
  selectInvestedAndStocksData,
  selectInvestedAndStocksIsLoading,
} from '../../../../redux/slices/mainDashboardSlice';
import { hostName } from '../../../../utils/host';
import DonutChart from './DonutChart/DonutChart';

const InvestedAndStocksContainer = () => {
  const data = useSelector(selectInvestedAndStocksData);
  const isLoading = useSelector(selectInvestedAndStocksIsLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      fetchInvestedAndStocksData(
        `${hostName}/dashboards/get_invested_and_stocks_data`
      )
    );
  }, []);

  return (
    <DonutChart
      data={data}
      isLoading={isLoading}
      title="Остатки и замороженные средства"
    />
  );
};

export default InvestedAndStocksContainer;
