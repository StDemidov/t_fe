import AnimatedNumbers from './AnimatedNumbers';
import BarplotCampaign from './BarplotCampaign';
import styles from './style.module.css';

const StatsCard = ({ metricArray, metricName, datesRange, lastUpdate }) => {
  const startDate = startOfDay(toDate(datesRange.startDate));
  const endDate = startOfDay(toDate(datesRange.endDate));
  const lastDate = startOfDay(toDate(lastUpdate));

  const data = [];
  const dates = [];

  metricArray.forEach((value, index) => {
    const offset = index - (metricArray.length - 1);
    const currentDate = startOfDay(addDays(lastDate, offset));

    if (currentDate < startDate || currentDate > endDate) return;

    data.push(value);
    dates.push(currentDate);
  });
  const total = data.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );

  return (
    <div className={styles.statsCard}>
      <div className={styles.leftSide}>
        <div className={styles.metricName}>{metricName}</div>
        <BarplotCampaign data={data} dates={dates} />
      </div>
      <div className={styles.rightSide}>
        <div className={styles.metricSummmary}>
          <AnimatedNumbers total={total} />
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
