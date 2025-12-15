import styles from './style.module.css';
import { useState } from 'react';
import CampaignsHeader from './elements/CampaignsHeader/CampaignsHeader';
import CampaignsBody from './elements/CampaignsBody/CampaignsBody';

const initialColumns = [
  {
    key: 'skuBase',
    label: '',
    hidden: false,
    cellStyle: styles.skuBaseCell,
  },
  {
    key: 'status',
    label: 'Статус',
    hidden: false,
    cellStyle: styles.statusCell,
  },
  {
    key: 'activeHours',
    label: 'Время активности',
    hidden: false,
    cellStyle: styles.activeHours,
  },
  {
    key: 'bidType',
    label: 'Тип',
    hidden: false,
    cellStyle: styles.bidType,
  },
  {
    key: 'bids',
    label: 'Ставки',
    hidden: false,
    cellStyle: styles.bids,
  },

  {
    key: 'ctrBench',
    label: 'Порог CTR',
    hidden: false,
    cellStyle: styles.ctrBench,
  },
  {
    key: 'turnover',
    label: 'Оборачиваемость',
    hidden: false,
    cellStyle: styles.turnover,
  },
  {
    key: 'totalSpend',
    label: 'Всего потрачено',
    hidden: false,
    cellStyle: styles.totalSpend,
  },
  {
    key: 'totalCTR',
    label: 'CTR кампании',
    hidden: false,
    cellStyle: styles.totalCTR,
  },
  { key: 'views', label: 'Показы', hidden: false, cellStyle: styles.views },
  { key: 'clicks', label: 'Клики', hidden: false, cellStyle: styles.clicks },
  { key: 'spend', label: 'Траты', hidden: false, cellStyle: styles.spend },
  { key: 'ctr', label: 'CTR', hidden: false, cellStyle: styles.ctr },
  {
    key: 'actionButtons',
    label: '',
    hidden: false,
    cellStyle: styles.actionButtons,
  },
];

const CampaignsTable = ({ campaigns, dates }) => {
  const [columns, setColumns] = useState(initialColumns);
  return (
    <div className={styles.tableWrapper}>
      <CampaignsHeader columns={columns} />
      <CampaignsBody columns={columns} campaigns={campaigns} dates={dates} />
    </div>
  );
};

export default CampaignsTable;
