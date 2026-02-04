import { useDispatch, useSelector } from 'react-redux';
import { addDays } from 'date-fns'; // Для работы с датами
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
import MainPlotBox from './elements/MainPlotBox';
import ChangesLogs from './elements/ChangesLogs';
import ClustersBox from './elements/ClustersBox';

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
        endDate: campaign.stats.endDate
          ? campaign.stats.endDate
          : campaign.lastUpdateStats,
      });
    }
  }, [campaign]);

  useEffect(() => {
    dispatch(fetchCampaign(`${hostName}/ad_camps/single/${id}`));
  }, [dispatch, id]);

  if (!campaign) {
    return <section>Загрузка...</section>;
  }
  console.log(campaign.stats.bidType);

  return (
    <section className={styles.fullSection}>
      <CampCard camp={campaign} />
      <div className={styles.secondBlock}>
        <DatesFilter
          datesRange={datesRange}
          setDatesRange={setDatesRange}
          maxDate={
            campaign.stats.endDate
              ? campaign.stats.endDate
              : campaign.lastUpdateStats
          }
          minDate={campaign.stats.creationDate}
        />
        <StatsSummary
          stats={campaign.stats}
          datesRange={datesRange}
          lastUpdate={
            campaign.stats.endDate
              ? campaign.stats.endDate
              : campaign.lastUpdateStats
          }
        />
      </div>
      <div className={styles.thirdBlock}>
        <MainPlotBox
          stats={campaign.stats}
          datesRange={datesRange}
          lastUpdate={
            campaign.stats.endDate
              ? campaign.stats.endDate
              : campaign.lastUpdateStats
          }
        />
        <ChangesLogs logs={campaign.logs} dates={datesRange} />
      </div>
      <div className={styles.fourthBlock}>
        <ClustersBox
          unified={campaign.stats.bidType === 'unified'}
          clusters={campaign.clusters}
          dates={datesRange}
          campId={id}
          lastUpdateClusters={
            campaign.stats.endDate
              ? campaign.stats.endDate < campaign.lastUpdateClusters
                ? addDays(campaign.stats.endDate, 1)
                : campaign.lastUpdateClusters
              : campaign.lastUpdateClusters
          }
        />
      </div>
    </section>
  );
};

export default CampaignPage;
