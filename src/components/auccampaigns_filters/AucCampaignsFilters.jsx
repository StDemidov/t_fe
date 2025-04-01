import AucNameFilter from './AucNameFilter/AucNameFilter';
import AucSorting from './AucSorting/AucSorting';
import AucStatusFilter from './AucStatusFilter/AucStatusFilter';
import styles from './style.module.css';

const AucCampaignsFilters = () => {
  let statuses = [
    'Остановлено в софте',
    'Пауза по оборачиваемости',
    'Идут показы',
  ];

  return (
    <div className={styles.filterSection}>
      <AucStatusFilter options={statuses} />
      <AucSorting />
      <AucNameFilter />
    </div>
  );
};

export default AucCampaignsFilters;
