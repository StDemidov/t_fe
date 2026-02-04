import React from 'react';
import MainPlot from './MainPlot';
import styles from './style.module.css';

const MainPlotBox = ({ stats, datesRange, lastUpdate }) => {
  const spendFull = [...stats.spendByDays, stats.todaySpend];
  const viewsFull = [...stats.viewsByDays, stats.todayViews];
  const clicksFull = [...stats.clicksByDays, stats.todayClicks];
  const ordersFull = [...stats.ordersByDays, stats.ordersToday];

  const startDate = startOfDay(toDate(datesRange.startDate));
  const endDate = startOfDay(toDate(datesRange.endDate));
  const lastDate = startOfDay(toDate(lastUpdate));

  const dates = getDatesForPlot(spendFull, lastDate, startDate, endDate);

  const spendPlotData = getDataForPlot(spendFull, lastDate, startDate, endDate);
  const viewsPlotData = getDataForPlot(viewsFull, lastDate, startDate, endDate);
  const clicksPlotData = getDataForPlot(
    clicksFull,
    lastDate,
    startDate,
    endDate
  );
  const ordersPlotData = getDataForPlot(
    ordersFull,
    lastDate,
    startDate,
    endDate
  );

  return (
    <div className={styles.mainPlotBox}>
      <MainPlot
        spend={spendPlotData}
        clicks={clicksPlotData}
        views={viewsPlotData}
        orders={ordersPlotData}
        dates={dates}
      />
    </div>
  );
};

export default MainPlotBox;

const getDataForPlot = (metricArray, lastDate, startDate, endDate) => {
  const data = [];

  metricArray.forEach((value, index) => {
    const offset = index - (metricArray.length - 1);
    const currentDate = startOfDay(addDays(lastDate, offset));

    if (currentDate < startDate || currentDate > endDate) return;

    data.push(value);
  });
  return data;
};

const getDatesForPlot = (metricArray, lastDate, startDate, endDate) => {
  const dates = [];

  metricArray.forEach((value, index) => {
    const offset = index - (metricArray.length - 1);
    const currentDate = startOfDay(addDays(lastDate, offset));

    if (currentDate < startDate || currentDate > endDate) return;

    dates.push(currentDate);
  });
  return dates;
};

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
