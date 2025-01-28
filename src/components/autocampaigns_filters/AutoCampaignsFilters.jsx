import ACBrandFilter from './ACBrandFilter/ACBrandFilter';
import ACCreatedByFilter from './ACCreatedByFilter/ACCreatedByFilter';
import ACNameFilter from './ACNameFilter/ACNameFilter';
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
      <ACNameFilter />
    </div>
  );
};

export default AutoCampaignsFilters;
