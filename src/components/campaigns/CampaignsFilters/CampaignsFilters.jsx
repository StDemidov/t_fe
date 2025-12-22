import SkuNameFilter from './filters/SkuNameFilter';
import styles from './style.module.css';

const CampaignsFilters = () => {
  return (
    <div className={styles.filtersMainDiv}>
      <SkuNameFilter />
    </div>
  );
};

export default CampaignsFilters;
