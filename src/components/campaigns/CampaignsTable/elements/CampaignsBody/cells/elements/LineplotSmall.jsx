import { Line } from 'react-chartjs-2';
import { useState } from 'react';
import styles from './style.module.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';

import { getDatesBetween } from '../../../../../../../utils/dataSlicing';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

const LineplotSmall = ({
  data,
  dates,
  need_average = true,
  perc = false,
  total = 0,
}) => {
  const [showAvg, setShowAvg] = useState(true);

  var labels = getDatesBetween(dates.start, dates.end);

  if (total == 0) {
    return <div className={styles.noData}>Нет данных</div>;
  }

  const colors = {
    common: 'rgba(130, 84, 255, 0.3)',
    last: 'rgba(84, 149, 255, 0.3)',
  };

  // Цвета точек
  const pointBackgroundColor = data.map(() => colors.common);
  pointBackgroundColor[data.length - 1] = colors.last;
  const chartData = {
    labels,
    datasets: [
      {
        data: data,
        fill: false,
        stepped: !perc,

        pointBackgroundColor,
        pointBorderColor: pointBackgroundColor,
        borderWidth: 1,
        pointRadius: 0.7,
        borderColor: (context) => {
          const index = context.dataIndex;
          const value = context.dataset.data[index];
          return value < 0
            ? 'rgba(255, 84, 84, 0.3)'
            : 'rgba(130, 84, 255, 0.3)';
        },
        segment: {
          borderColor: (context) => {
            const value = context.p0.parsed.y;
            return value < 0
              ? 'rgba(255, 84, 84, 0.3)'
              : 'rgba(130, 84, 255, 0.3)';
          },
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        bodyColor: '#ffffff',
        titleFont: { size: 6, weight: 'bold' },
        bodyFont: { size: 9 },
        padding: { top: 4, right: 6, bottom: 4, left: 6 },
        caretSize: 0,
        displayColors: false,
        titleAlign: 'center',
        bodyAlign: 'center',
      },
    },
    scales: {
      x: { display: false },
      y: { display: false, beginAtZero: true },
    },
  };

  const avgClassName = total < 0 ? styles.sumNegative : styles.sumPositive;

  return (
    <div
      className={styles.barWrapper}
      onMouseEnter={() => setShowAvg(false)}
      onMouseLeave={() => setShowAvg(true)}
    >
      {(need_average || perc) && (
        <div
          className={`${styles.sumOverlay} ${avgClassName} ${
            showAvg ? styles.visible : styles.hidden
          }`}
        >
          {perc
            ? (total * 100).toFixed(2).toLocaleString() + ' %'
            : (total * 100).toFixed(2).toLocaleString()}
        </div>
      )}
      <div
        className={`${styles.chartContainer} ${
          showAvg && (need_average || perc) ? styles.dimmed : ''
        }`}
      >
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineplotSmall;
