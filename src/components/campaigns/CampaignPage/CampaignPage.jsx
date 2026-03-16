import { useDispatch, useSelector } from 'react-redux';
import { addDays } from 'date-fns'; // Для работы с датами
import CampCard from './elements/CampCard';
import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
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
import { calculateArraySum } from '../../../utils/calculations';

const CampaignPage = () => {
  const dispatch = useDispatch();

  const { id } = useParams();

  const campaign = useSelector(selectCampaignById(id));
  const [datesRange, setDatesRange] = useState({
    startDate: null,
    endDate: null,
  });
  let totalViews = 0;
  let totalClicks = 0;
  let totalOrders = 0;
  let totalAddToCart = 0;
  let totalSpend = 0;

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

  const lastUpdateClusters = campaign?.stats?.endDate
    ? campaign?.stats?.endDate < campaign?.lastUpdateClusters
      ? addDays(campaign?.stats?.endDate, 1)
      : campaign?.lastUpdateClusters
    : campaign?.lastUpdateClusters;
  const computedData = useMemo(() => {
    if (!campaign?.clusters) return [];

    return campaign.clusters.map((item, idx) => {
      const data = computeAllData(item, lastUpdateClusters, datesRange);
      totalViews += data.views.total;
      totalClicks += data.clicks.total;
      totalOrders += data.orders.total;
      totalAddToCart += data.toCart.total;
      totalSpend += data.spend.total;
      return {
        id: idx,
        cluster: item.cluster,
        disabled: item.disabled,
        bid: item.bid,
        views: data.views,
        clicks: data.clicks,
        orders: data.orders,
        toCart: data.toCart,
        ctr: data.ctr,
        toCartCr: data.toCartCr,
        pos: data.pos,
        ctrTotal: data.ctrTotal,
        toCartCrTotal: data.toCartCrTotal,
        spend: data.spend,
      };
    });
  }, [campaign?.clusters, datesRange, lastUpdateClusters]);

  if (!campaign) {
    return <section>Загрузка...</section>;
  }

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
          clusters={computedData}
          dates={datesRange}
          campId={id}
          totalViews={totalViews}
          totalClicks={totalClicks}
          totalOrders={totalOrders}
          totalAddToCart={totalAddToCart}
          totalSpend={totalSpend}
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

function getDataByDates(data, lastUpdateClusters, { startDate, endDate }) {
  const resultData = [];
  const resultDates = [];

  const n = data.length;

  for (let i = 0; i < n; i++) {
    const currentDate = new Date(lastUpdateClusters);
    currentDate.setDate(currentDate.getDate() - (n - i));

    if (currentDate >= startDate && currentDate <= endDate) {
      resultData.push(data[i]);
      resultDates.push(new Date(currentDate));
    }
  }

  return {
    data: resultData,
    dates: resultDates,
    total: calculateArraySum(resultData),
  };
}

function computeAllData(cluster, lastUpdateClusters, dates) {
  const orders = getDataByDates(
    cluster.ordersByDays,
    lastUpdateClusters,
    dates
  );
  const views = getDataByDates(cluster.viewsByDays, lastUpdateClusters, dates);
  const clicks = getDataByDates(
    cluster.clicksByDays,
    lastUpdateClusters,
    dates
  );
  const toCart = getDataByDates(
    cluster.toCartByDays,
    lastUpdateClusters,
    dates
  );
  const spend = getDataByDates(cluster.spendByDays, lastUpdateClusters, dates);

  const ctrCalc = clicks.data.map((clck, index) => {
    const vws = views.data[index];
    if (vws === 0) {
      return 0;
    }
    return ((clck / vws) * 100).toFixed(2);
  });

  const toCartCR = toCart.data.map((crt, index) => {
    const vws = views.data[index];
    if (vws === 0) {
      return 0;
    }
    return ((crt / vws) * 100).toFixed(2);
  });

  const ctr = {
    data: ctrCalc,
    dates: views.dates,
  };

  const toCartCr = {
    data: toCartCR,
    dates: views.dates,
  };

  const viewsTotal = calculateArraySum(views.data);
  const clickTotal = calculateArraySum(clicks.data);
  const toCartTotal = calculateArraySum(toCart.data);
  const ctrTotal =
    viewsTotal === 0 ? 0 : ((clickTotal / viewsTotal) * 100).toFixed(2);
  const pos = getDataByDates(cluster.positionByDays, lastUpdateClusters, dates);
  const toCartCrTotal =
    viewsTotal === 0 ? 0 : ((toCartTotal / viewsTotal) * 100).toFixed(2);

  return {
    orders,
    views,
    clicks,
    spend,
    toCart,
    ctr,
    pos,
    ctrTotal,
    toCartCr,
    toCartCrTotal,
  };
}
