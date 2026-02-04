import { calculateArraySum } from '../../../../utils/calculations';
import AnimatedNumbers from './AnimatedNumbers';
import BarplotCampaign from './BarplotCampaign';
import LineplotCampaign from './LineplotCampaign';
import StackedBarplotCampaign from './StackedBarplotCampaign';
import styles from './style.module.css';

const StatsCard = ({
  metricArray,
  assocMetricArray,
  metricName,
  datesRange,
  lastUpdate,
  percents = false,
  percentsTotal = null,
}) => {
  const startDate = startOfDay(toDate(datesRange.startDate));
  const endDate = startOfDay(toDate(datesRange.endDate));
  const lastDate = startOfDay(toDate(lastUpdate));

  const data = [];
  const assocData = [];
  const dates = [];

  metricArray.forEach((value, index) => {
    const offset = index - (metricArray.length - 1);
    const currentDate = startOfDay(addDays(lastDate, offset));

    if (currentDate < startDate || currentDate > endDate) return;
    if (assocMetricArray) {
      assocData.push(assocMetricArray[index]);
    }
    data.push(value);
    dates.push(currentDate);
  });
  const total = percents ? percentsTotal : calculateArraySum(data);

  return (
    <div className={styles.statsCard}>
      <div className={styles.leftSide}>
        <div className={styles.metricName}>{metricName}</div>
        <div className={styles.barPlot}>
          {percents ? (
            <LineplotCampaign data={data} dates={dates} />
          ) : assocMetricArray ? (
            <StackedBarplotCampaign
              data={data}
              totalData={data}
              associatedData={assocData}
              dates={dates}
            />
          ) : (
            <BarplotCampaign data={data} dates={dates} />
          )}
        </div>
      </div>
      <div className={styles.rightSide}>
        <div className={styles.metricSummmary}>
          {percents ? percentsTotal : <AnimatedNumbers total={total} />}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

const toDate = (d) => (d instanceof Date ? new Date(d) : new Date(d));

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const formatDate = (date) =>
  date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  });
