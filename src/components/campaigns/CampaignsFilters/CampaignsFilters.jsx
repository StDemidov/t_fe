import { useDispatch, useSelector } from 'react-redux';
import { STATUSES } from '../../../utils/base_utils/campConsts';
import CategoryFilter from './filters/CategoryFilter';
import DatesFilter from './filters/DatesFilter';
import EndedFilter from './filters/EndedFilter';
import SkuNameFilter from './filters/SkuNameFilter';
import StatusFilter from './filters/StatusFilter';
import TypeFilter from './filters/TypeFilter';
import styles from './style.module.css';
import {
  selectFilterTableDates,
  setFilterTableDates,
} from '../../../redux/slices/campaignsSlice';
import CampaignsSorting from './filters/CampaignsSorting';

const CampaignsFilters = ({ campaigns }) => {
  const dates = useSelector(selectFilterTableDates);
  const dispatch = useDispatch();
  const setTableDates = (dates) => {
    dispatch(setFilterTableDates(dates));
  };
  let statusOptionsRaw = campaigns.map((camp) => {
    return camp.status;
  });
  statusOptionsRaw = [...new Set(statusOptionsRaw)];
  const statusOptions = statusOptionsRaw.map((stts) => {
    return { key: Number(stts), name: STATUSES[stts].text };
  });
  const typeOptions = [
    { key: 'unified', name: 'Единая' },
    { key: 'manual', name: 'Ручная' },
  ];
  let categoryOptionsRaw = campaigns.map((camp) => {
    return camp.category;
  });
  categoryOptionsRaw = [...new Set(categoryOptionsRaw)];
  const categoryOptions = categoryOptionsRaw.map((category) => {
    return { key: category, name: category };
  });

  return (
    <div className={styles.filtersMainDiv}>
      <DatesFilter
        datesRange={dates}
        maxDate={dates.maxDate}
        setDatesRange={setTableDates}
      />
      <CampaignsSorting />
      <StatusFilter options={statusOptions} />
      <TypeFilter options={typeOptions} />
      <CategoryFilter options={categoryOptions} />
      <SkuNameFilter />
      <EndedFilter />
    </div>
  );
};

export default CampaignsFilters;
