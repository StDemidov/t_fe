import { Doughnut } from 'react-chartjs-2';
import { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import {
  MdOutlineKeyboardArrowUp,
  MdOutlineKeyboardArrowDown,
} from 'react-icons/md';
import styles from './style.module.css';

const DoughnutPlot = ({ buyoutPercAVG, benchmark }) => {
  const isAboveBenchmark = buyoutPercAVG >= benchmark;
  const difference = Math.abs(buyoutPercAVG - benchmark).toFixed(1);
  const [hovered, setHovered] = useState(false);

  ChartJS.register(ArcElement, Tooltip);
  const chartData = {
    labels: ['Buyout %', 'Remaining'],
    datasets: [
      {
        data: [buyoutPercAVG, 100 - buyoutPercAVG],
        backgroundColor: [
          isAboveBenchmark ? 'rgba(130, 84, 255, 1)' : 'rgba(255, 84, 84, 1)', // зелёный или красный
          '#e0e0e0', // серый фон
        ],
        borderWidth: 0,
        cutout: hovered ? '90%' : '70%',
      },
    ],
  };

  const chartOptions = {
    cutout: hovered ? '90%' : '70%',
    plugins: {
      tooltip: {
        enabled: false,
      },
      legend: { display: false },
    },
  };

  return (
    <div
      className={styles.barWrapper}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Doughnut data={chartData} options={chartOptions} />
      <div className={styles.textInside} style={{ opacity: hovered ? 0 : 1 }}>
        {buyoutPercAVG} %
      </div>
      <div
        className={styles.textDiff}
        style={{
          color: isAboveBenchmark
            ? 'rgba(130, 84, 255, 1)'
            : 'rgba(255, 84, 84, 1)',
          opacity: hovered ? 1 : 0,
        }}
      >
        {isAboveBenchmark ? (
          <MdOutlineKeyboardArrowUp />
        ) : (
          <MdOutlineKeyboardArrowDown />
        )}
        {Number(difference).toFixed(0)}%
      </div>
    </div>
  );
};

export default DoughnutPlot;
