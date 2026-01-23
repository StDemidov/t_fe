import StatsCard from './StatsCard';
import styles from './style.module.css';

const StatsSummary = ({ stats, datesRange, lastUpdate }) => {
  const spendFull = [...stats.spendByDays, stats.todaySpend];
  const viewsFull = [...stats.viewsByDays, stats.todayViews];
  const clicksFull = [...stats.clicksByDays, stats.todayClicks];

  return (
    <div className={styles.statsSummary}>
      <div className={styles.statsRow}>
        <StatsCard
          metricName={'Траты'}
          metricArray={spendFull}
          datesRange={datesRange}
          lastUpdate={lastUpdate}
        />
        <StatsCard
          metricName={'Показы'}
          metricArray={viewsFull}
          datesRange={datesRange}
          lastUpdate={lastUpdate}
        />
        <StatsCard
          metricName={'Клики'}
          metricArray={clicksFull}
          datesRange={datesRange}
          lastUpdate={lastUpdate}
        />
      </div>
      <div className={styles.statsRow}>
        {/* <StatsCard metricName={'CTR'} />
        <StatsCard />
        <StatsCard /> */}
      </div>
    </div>
  );
};

export default StatsSummary;
