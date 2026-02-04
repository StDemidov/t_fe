import { calculateArraySum } from '../../../../utils/calculations';
import StatsCard from './StatsCard';
import styles from './style.module.css';

const StatsSummary = ({ stats, datesRange, lastUpdate }) => {
  const spendFull = [...stats.spendByDays, stats.todaySpend];
  const viewsFull = [...stats.viewsByDays, stats.todayViews];
  const clicksFull = [...stats.clicksByDays, stats.todayClicks];
  const ordersFull = [...stats.ordersByDays, stats.ordersToday];
  const assocOrdersFull = [...stats.assocOrdersByDays, stats.assocOrdersToday];
  const toCartFull = [...stats.toCartByDays, stats.toCartToday];
  const assocToCartFull = [...stats.assocToCartByDays, stats.assocToCartToday];
  const ctrFull = clicksFull.map((clicks, index) => {
    const views = viewsFull[index];
    if (views === 0) {
      return 0;
    }
    return ((clicks / views) * 100).toFixed(2);
  });

  const viewsTotal = calculateArraySum(viewsFull);
  const clickTotal = calculateArraySum(clicksFull);
  const ctrTotal =
    viewsTotal === 0 ? 0 : ((clickTotal / viewsTotal) * 100).toFixed(2);

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
        <StatsCard
          metricName={'CTR'}
          metricArray={ctrFull}
          datesRange={datesRange}
          lastUpdate={lastUpdate}
          percents={true}
          percentsTotal={ctrTotal}
        />
        <StatsCard
          metricName={'Заказы'}
          assocMetricArray={assocOrdersFull}
          metricArray={ordersFull}
          datesRange={datesRange}
          lastUpdate={lastUpdate}
        />
        <StatsCard
          metricName={'В корзину'}
          assocMetricArray={assocToCartFull}
          metricArray={toCartFull}
          datesRange={datesRange}
          lastUpdate={lastUpdate}
        />
      </div>
    </div>
  );
};

export default StatsSummary;
