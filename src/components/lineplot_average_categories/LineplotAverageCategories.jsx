import { useState } from 'react';
import { getDateNumberArray } from '../../utils/dataSlicing';
import { Line } from 'react-chartjs-2';
import styles from './style.module.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

const LineplotAverage = ({
  data,
  need_average = false,
  perc = false,
  total = 0,
}) => {
  const [showAvg, setShowAvg] = useState(true);
  const labels = getDateNumberArray(data);

  if (perc) {
    data = data.map((item) => item * 100);
  }

  // Среднее значение
  const filtered = data.filter((d) => typeof d === 'number');
  const average =
    filtered.length === 0
      ? 0
      : filtered.reduce((a, b) => a + b, 0) / filtered.length;

  if (average === 0) {
    return <>Нет данных</>;
  }

  // Цветовая схема
  const colors = {
    positive: 'rgba(130, 84, 255, 0.3)',
    negative: 'rgba(255, 84, 84, 0.3)',
    zero: '#aaaaaa',
  };

  // Цвета точек
  const pointBackgroundColor = data.map((v) =>
    v > 0 ? colors.positive : v < 0 ? colors.negative : colors.zero
  );

  const chartData = {
    labels,
    datasets: [
      {
        data: data,
        fill: false,
        stepped: !perc,

        pointBackgroundColor,
        pointBorderColor: pointBackgroundColor,
        borderWidth: 1.2,
        pointRadius: 1.2,
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
        bodyFont: { size: 15 },
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

  const avgClassName = average < 0 ? styles.sumNegative : styles.sumPositive;

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
          {perc ? total + ' %' : average.toFixed(0).toLocaleString()}
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

export default LineplotAverage;
