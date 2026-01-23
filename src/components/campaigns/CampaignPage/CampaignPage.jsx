import { useDispatch, useSelector } from 'react-redux';
import CampCard from './elements/CampCard';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  fetchCampaign,
  selectCampaignById,
} from '../../../redux/slices/campaignsSlice';
import { hostName } from '../../../utils/host';
import DatesFilter from './filters/DatesFilter/DatesFilter';

import styles from './style.module.css';
import StatsSummary from './elements/StatsSummary';

const CampaignPage = () => {
  const dispatch = useDispatch();

  const { id } = useParams();

  const campaign = useSelector(selectCampaignById(id));
  const [datesRange, setDatesRange] = useState({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    if (campaign?.lastUpdateStats && campaign?.stats?.creationDate) {
      setDatesRange({
        startDate: campaign.stats.creationDate,
        endDate: campaign.lastUpdateStats,
      });
    }
  }, [campaign]);

  useEffect(() => {
    dispatch(fetchCampaign(`${hostName}/ad_camps/single/${id}`));
  }, [dispatch, id]);

  if (!campaign) {
    return <section>Загрузка...</section>;
  }
  console.log(datesRange);

  return (
    <section className={styles.fullSection}>
      <CampCard camp={campaign} />
      <div className={styles.secondBlock}>
        <DatesFilter
          datesRange={datesRange}
          setDatesRange={setDatesRange}
          maxDate={campaign.lastUpdateStats}
          minDate={campaign.stats.creationDate}
        />
        <StatsSummary
          stats={campaign.stats}
          datesRange={datesRange}
          lastUpdate={campaign.lastUpdateStats}
        />
      </div>
    </section>
  );
};

export default CampaignPage;
