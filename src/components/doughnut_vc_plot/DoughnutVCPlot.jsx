import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import styles from './style.module.css';

const DoughnutVCPlot = ({ buyoutPercAVG }) => {
  // const isAboveBenchmark = buyoutPercAVG >= benchmark;
  // const difference = Math.abs(buyoutPercAVG - benchmark).toFixed(1);
  // const [hovered, setHovered] = useState(false);

  ChartJS.register(ArcElement, Tooltip);
  const chartData = {
    labels: ['Buyout %', 'Remaining'],
    datasets: [
      {
        data: [buyoutPercAVG, 100 - buyoutPercAVG],
        backgroundColor: ['rgba(130, 84, 255, 1)', '#e0e0e0'],
        borderWidth: 0,
        cutout: '90%',
      },
    ],
  };

  const chartOptions = {
    cutout: '90%',
    plugins: {
      tooltip: {
        enabled: false,
      },
      legend: { display: false },
    },
  };

  return (
    <div className={styles.barWrapper}>
      <Doughnut data={chartData} options={chartOptions} />
      <div className={styles.textInside}>
        {buyoutPercAVG} <span>%</span>
      </div>
    </div>
  );
};

export default DoughnutVCPlot;
