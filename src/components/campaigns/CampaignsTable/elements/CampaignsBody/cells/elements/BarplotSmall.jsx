import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import styles from './style.module.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

import { getDatesBetween } from '../../../../../../../utils/dataSlicing';

ChartJS.register(CategoryScale, LinearScale, BarElement);

const BarplotSmall = ({ data, dates, need_sum = true, last_item = false }) => {
  const [showSum, setShowSum] = useState(true);
  let total = 0;

  var labels = getDatesBetween(dates.start, dates.end);

  if (last_item) {
    total = data.slice(-1);
  } else {
    total = data.reduce((acc, val) => acc + val, 0);
  }

  if (!last_item && total === 0) {
    return <div className={styles.noData}>Нет данных</div>;
  }

  // Цвета
  const colors = {
    positive: {
      fill: 'rgba(130, 84, 255, 0.3)',
      border: 'rgba(130, 84, 255, 1)',
      hover: '#816ce8',
    },
    last: {
      fill: 'rgba(84, 149, 255, 0.3)',
      border: 'rgb(84, 192, 255)',
      hover: 'rgb(84, 192, 255)',
    },
  };

  const backgroundColor = data.map(() => colors.positive.fill);
  const borderColor = data.map(() => colors.positive.border);
  const hoverColor = data.map(() => colors.positive.hover);

  backgroundColor[data.length - 1] = colors.last.fill;
  borderColor[data.length - 1] = colors.last.border;
  hoverColor[data.length - 1] = colors.last.hover;

  const chartData = {
    labels,
    datasets: [
      {
        data: data,
        backgroundColor,
        borderColor,
        hoverBackgroundColor: hoverColor,
        borderWidth: 0,
        borderRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        enabled: true,
        yAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: { size: 6, weight: 'bold' },
        bodyFont: { size: 9 },
        bodyColor: '#ffffff',
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

  const sumClassName = total < 0 ? styles.sumNegative : styles.sumPositive;

  return (
    <div
      className={styles.barWrapper}
      onMouseEnter={() => setShowSum(false)}
      onMouseLeave={() => setShowSum(true)}
    >
      {need_sum && (
        <div
          className={`${styles.sumOverlay} ${sumClassName} ${
            showSum ? styles.visible : styles.hidden
          } ${total == 0 ? styles.sumNegative : ''}`}
        >
          {total.toLocaleString()}
        </div>
      )}
      <div
        className={`${styles.chartContainer} ${
          showSum && need_sum ? styles.dimmed : ''
        }`}
      >
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default BarplotSmall;
