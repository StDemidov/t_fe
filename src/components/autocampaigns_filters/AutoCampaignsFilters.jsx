import ACBrandFilter from './ACBrandFilter/ACBrandFilter';
import ACCreatedByFilter from './ACCreatedByFilter/ACCreatedByFilter';
import ACHasActiveHoursFilter from './ACHasActiveHoursFilter/ACHasActiveHoursFilter';
import ACNameFilter from './ACNameFilter/ACNameFilter';
import ACSorting from './ACSorting/ACSorting';
import ACStatusFilter from './ACStatusFilter/ACStatusFilter';
import styles from './style.module.css';

const AutoCampaignsFilters = ({ cmpgns }) => {
  let brands = [...new Set(cmpgns.flatMap((item) => item.brand))];
  let statuses = [...new Set(cmpgns.flatMap((item) => item.status))];
  let createdBy = [...new Set(cmpgns.flatMap((item) => item.createdBy))];

  return (
    <div className={styles.filterSection}>
      <ACBrandFilter options={brands} />
      <ACCreatedByFilter options={createdBy} />
      <ACStatusFilter options={statuses} />
      <ACHasActiveHoursFilter />
      <ACSorting />
      <ACNameFilter />
    </div>
  );
};

export default AutoCampaignsFilters;
